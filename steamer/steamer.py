from flask import Flask, request, abort

from bson.json_util import dumps, loads
from pymongo import MongoClient

import pythoncom
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket

app = Flask(__name__)

client = MongoClient()
db = client['steamer']

@app.route('/')
def hello_world():
    return 'Hello World!!!!%s' % request.args.get("closed", False)

@app.route('/api/jobs')
def jobs():
    if request.args.get("open") == "true":
        return dumps(db['jobs'].find({"closed": {"$exists": False}}))
    else:
        return dumps(db['jobs'].find({"closed": True}))

# Can only update jobs here. Create by posting to jobs.
@app.route('/api/jobs/<int:jobNumber>', methods=['GET', 'POST'])
def job(jobNumber):
    if request.method == 'GET':
        job = db['jobs'].find_one({"jobNumber": jobNumber})
        if job:
            return dumps(job)
        else:
            abort(404)
    elif request.method == 'POST':
        job = db['jobs'].find_one({"jobNumber": jobNumber})
        if not job:
            job = loads(request.data)
        else:
            new_data = loads(request.data)
            for k,v in new_data.iteritems():
                if k != "_id":
                    job[k] = v
        db['jobs'].save(job)
        return dumps(job)
            
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
