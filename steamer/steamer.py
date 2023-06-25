from flask import Flask, request, abort

from bson.json_util import dumps, loads
from pymongo import MongoClient
import json

import pythoncom
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sqlite3
from contextlib import closing

app = Flask(__name__)

client = MongoClient()
db_mongo = client['steamer']

db = sqlite3.connect("steamer-db.db")
db.row_factory = sqlite3.Row

cur = db.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS jobs (job TEXT)")
db.commit()

cursor = lambda: closing(db.cursor())

@app.route('/api/jobs')
def jobs():
    with cursor() as cur:
        if request.args.get("open") == "true":
            cur.execute("SELECT job FROM jobs WHERE json_extract(job,'$.closed') = 0 OR json_extract(job,'$.closed') IS NULL")
            #return dumps(db_mongo['jobs'].find({"$or": [{"closed": {"$exists": False}}, {"closed": False}]}))
        else:
            cur.execute("SELECT job FROM jobs WHERE json_extract(job,'$.closed') = 1")
            #return dumps(db_mongo['jobs'].find({"closed": True}))
        return [row['job'] for row in cur.fetchall()]
    

def get_job(number):
    with cursor() as cur:
        cur.execute("SELECT job FROM jobs WHERE json_extract(json(job),'$.jobNumber') = ?", [number])
        job = cur.fetchone()
        print("Loaded job:", number, job)
        if job:
            job = json.loads(job)
        return job


@app.route('/api/jobs/<int:jobNumber>', methods=['GET', 'POST'])
def job(jobNumber):
    if request.method == 'GET':
        # Get a job by job number
        job = get_job(jobNumber)
        #job = db_mongo['jobs'].find_one({"jobNumber": jobNumber})
        if job:
            return json.dumps(job)
        else:
            abort(404)
    elif request.method == 'POST':
        # Create or update a job
        job = get_job(jobNumber)
        #job = db_mongo['jobs'].find_one({"jobNumber": jobNumber})
        if not job:
            # Create
            job = json.loads(request.data)
            db.execute("INSERT INTO jobs (job) VALUES (?)", [json.dumps(job)])
            print("Created job", jobNumber, job)
        else:
            # Update
            new_data = json.loads(request.data)
            for k,v in new_data.iteritems():
                if k != "_id":
                    job[k] = v
            db.execute("UPDATE jobs SET job = ? WHERE json_extract(json(job),'$.jobNumber') = ?", [json.dumps(job), jobNumber])
            print("Updated job", jobNumber, job)

        #db_mongo['jobs'].save(job_mongo)
        return json.dumps(job)
            
class AppServerSvc (win32serviceutil.ServiceFramework):
    _svc_name_ = "SteamerServer"
    _svc_display_name_ = "Steamer Server"
    _svc_deps_ = ["MongoDB"]

    def __init__(self,args):
        win32serviceutil.ServiceFramework.__init__(self,args)
        self.hWaitStop = win32event.CreateEvent(None,0,0,None)
        socket.setdefaulttimeout(60)

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)

    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_,''))
        self.main()

    def main(self):
		#app.debug = True
        app.run()

if __name__ == '__main__':
	win32serviceutil.HandleCommandLine(AppServerSvc)
