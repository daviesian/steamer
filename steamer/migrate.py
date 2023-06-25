from pymongo import MongoClient
from bson.json_util import dumps, loads
import json
import sqlite3
from contextlib import closing

client = MongoClient()
db_mongo = client['steamer']

with closing(sqlite3.connect("steamer-db.db")) as db
    db.row_factory = sqlite3.Row

    with closing(db.cursor()) as cur:
        cur.execute("CREATE TABLE IF NOT EXISTS jobs (job TEXT)")
        cur.execute("TRUNCATE jobs")
        db.commit()

    jobs = db_mongo['jobs'].find()

    with closing(db.cursor()) as cur:
        for job in jobs:
            job = json.loads(dumps(job))
            del job['_id']

            print("Saving job", job)
            cur.execute("INSERT INTO jobs (job) VALUES (?)", json.dumps(job))

        db.commit()

print("Done")