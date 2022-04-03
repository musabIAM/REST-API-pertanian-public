let db = require('../app').db;
let users = db.collection('user_petani');

exports.tampil_lahan = async function (req, res) {
  users.find({}).toArray(function(err, result) {
    if (err) {
      return res.json({ success: false, data: err }) 
    } else {
      return res.json({ success: true, data: result }) 
    }
  })
}
exports.filter_lahan = async function (req, res) {
  var owner = req.body.owner
  users.findOne({'owner': owner}, {'lahan':true}, function(err, result) {
    if (err) {
      return res.json({ success: false, data: err }) 
    } else {
      return res.json({ success: true, data: result }) 
    }
  })
}
exports.filter_log = async function (req, res) {
  var inputOwner = req.body.owner
  await users.aggregate( [
      {
        $match : { 'owner' : inputOwner }
      },
      {
         $project:
         {
            "lahan.log_book": 1 
         } 
      },
      {
        $unwind : '$lahan'
      }
   ] ).toArray(function (err, result) {
    if (err) {
    return res.json({ success: true, data: err }) 
    } else { 
    return res.json({ success: true, data: result }) 
    }
  })
}

