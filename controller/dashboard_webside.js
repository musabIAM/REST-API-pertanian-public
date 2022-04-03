let db = require('../app').db;
const fs = require('fs-extra')

let user = db.collection('user_petani');
let plants = db.collection('plants');

exports.findAllUser = async function (req, res) {
  user.find({}).toArray(function(err, result) {
    if (err) {
      return res.json({ success: false, data: err }) 
    } else {
      return res.json({ success: true, data: result }) 
    }
  })
}

exports.filterlahan = async function (req, res) {
  var owner = req.body.owner
  user.find({'owner': owner}, {'lahan': true}).toArray(function(err, result) {
    if (err) {
      return res.json({ success: false, data: err }) 
    } else {
      return res.json({ success: true, data: result }) 
    }
  })
}

exports.filterlahanBy = async function (req, res) {
  var jenis_Tanaman = req.body.jenis_tanaman
  user.aggregate([
    { $unwind: '$lahan' },
    { $match: { 'lahan.jenis_tanaman': { $eq: 'Padi' } } },
    { $group: { _id: '$_id', list: { $push: '$lahan' } } },
    { $unwind: '$list' }
  ]).toArray(function(err, result) {
  // user.find({"owner": "Budi"},{lahan: {$elemMatch: {jenis_tanaman: jenis_Tanaman}}}).toArray(function(err, result) {
    if (err) {
      return res.json({ success: false, data: err }) 
    } else {
      return res.json({ success: true, data: result }) 
    }
  })
}

exports.filterLog = async function (req, res) {
  var inputOwner = req.body.owner
  await user.aggregate( [
      {
        $match : { 'owner' : inputOwner }
      },
      {
         $project: 
         {
            "lahan.log_book": 1 ,
            "lahan.guidLahan": 1,
            
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

exports.filterLogByLahanName = async function (req, res) {
  var inputLahan = req.body.guidlahan
  var inputOwner = req.body.owner
    user.aggregate([
      {$unwind : '$lahan'},
      { $match: { 'lahan.guidLahan': { $eq: inputLahan } } },
       { $group: { _id: '$_id', list: { $push: '$lahan' } } }// { $project :{}  }
    ]).toArray(function(err, result) {
      if (err) {
        return res.json({ success: false, data: err }) 
      } else {
        return res.json({ success: true, data: result }) 
      }
    })
}

exports.tanaman_index = async function (req, res) {
  let fetchData = await plants.find({}).toArray()
  return res.json({ success: true, data: fetchData })
}

exports.tanaman_show = async function (req, res) {
  let fetchData = await plants.findOne({ name: req.params.name })
  return res.json({ success: true, data: fetchData })
}
