from flask import Flask, request, abort

from bson.json_util import dumps, loads
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient()
db = client['steam_packet']

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/api/jobs')
def jobs():
    return dumps(db['jobs'].find())

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
            


if __name__ == '__main__':
    #app.debug = True
    app.run()