# uv venv
# uv pip install -r requirements.txt
# uv run python steamer.py

from flask import Flask, request, abort
import sqlite3
from contextlib import closing
import os
import json

app = Flask(__name__)

DB_PATH=os.getenv("STEAMER_DB") or r"steamer-db.db"
PORT = os.getenv("STEAMER_PORT", "5000")

def connect():
    d = sqlite3.connect(DB_PATH)
    d.row_factory = sqlite3.Row
    d.isolation_level = None
    return closing(d)

cursor = lambda db: closing(db.cursor())

with connect() as db:
    db.execute("CREATE TABLE IF NOT EXISTS jobs (job TEXT)")

@app.route('/api/jobs')
def jobs():
    with connect() as db:
        with cursor(db) as cur:
            if request.args.get("open") == "true":
                cur.execute("SELECT job FROM jobs WHERE json_extract(job,'$.closed') = 0 OR json_extract(job,'$.closed') IS NULL")
            else:
                cur.execute("SELECT job FROM jobs WHERE json_extract(job,'$.closed') = 1")
            return [json.loads(row['job']) for row in cur.fetchall()]
    

def get_job(db, number):
    with cursor(db) as cur:
        cur.execute("SELECT job FROM jobs WHERE json_extract(job,'$.jobNumber') = ?", [number])
        row = cur.fetchone()
        if row:
            print("Loaded job:", number, row['job'])
            return json.loads(row['job'])
        else:
            return None


@app.route('/api/jobs/<int:jobNumber>', methods=['GET', 'POST'])
def job(jobNumber):
    with connect() as db:
        if request.method == 'GET':
            # Get a job by job number
            job = get_job(db, jobNumber)
            if job:
                return json.dumps(job)
            else:
                abort(404)
        elif request.method == 'POST':
            # Create or update a job
            job = get_job(db, jobNumber)
            if not job:
                # Create
                job = json.loads(request.data)
                db.execute("INSERT INTO jobs (job) VALUES (?)", [json.dumps(job)])
                print("Created job", jobNumber, job)
            else:
                # Update
                new_data = json.loads(request.data)
                for k,v in new_data.items():
                    if k != "_id":
                        job[k] = v
                db.execute("UPDATE jobs SET job = ? WHERE json_extract(job,'$.jobNumber') = ?", [json.dumps(job), jobNumber])
                print("Updated job", jobNumber, job)

            return json.dumps(job)
            
if __name__ == '__main__':
	app.debug = True
	app.run(port=PORT)
