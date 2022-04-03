let db = require('../app').db;
let chenel = require('../app').chnannel
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const md5 = require('md5')

let user = db.collection('A1EC19E0A2');
let db_water = db.collection('WaterFlow_History');
let db_soil = db.collection('Tanah_History');

exports.tambah_lahan = async function (req, res) {
  try {
    const data = { // contoh data inputan lahan
      nama_lahan: req.body.nama,
      location: {
          long: '10.22112',
          lat: '-71.1231132'
      },
      guidLahan: uuid(),
      foto_lahan: [],
      log_book: [],
      list_grup:[],
      timestamp: new Date,
      petani_pegarap: 'Kol Masturi',
      tanggal_tanam: '09092019',
      estimasi_panen: '09122019',
      jenis_tanaman: 'kol',
      lokasi_kelurahan: 'Jaja',
      kelompok_tani: 'Nur'
  }
  
  const dataResponse = await user.updateOne({owner: req.body.owner}, {$push :{'lahan': data}})
  return res.json({ success: true, data: dataResponse })
  } catch (error) {
    return res.json({ success: false, data: error})
  }
}

exports.tambah_group = async function (req, res) {
  try {
    dataPost = {
      'nama_group': req.body.nama,
      'guid_group': uuid(),
      'macaddress_solenoid': req.body.solenoid,
      'macaddress_waterflow': req.body.water,
      'schedule': {},
      'list_zona': []
    }
    dataResponse = await user.updateOne({owner: req.body.owner, "lahan.guidLahan": req.body.guid_lahan}, {$push: {'lahan.$.list_grup': dataPost}})
    return res.json({ success: true, data: dataResponse }) 
  } catch (error) {
    return res.json({ success: false, data: error })
  }
}

exports.tambah_zona = async function (req, res) {
  try {
    dataPost = {
      'nama_zona': req.body.nama,
      'guid_zona': uuid(),
      'tipe_zona': '',
      'setting': '',
      'schedule': [],
      'list_device': []
    }
    
    dataResponse = await user.updateOne({owner: req.body.owner, "lahan.guidLahan": req.body.guid_lahan},
      { $push: { 'lahan.$[].list_grup.$[id].list_zona': dataPost} },
      { arrayFilters: [{ 'id.guid_group': req.body.guid_grup }]
    })

    return res.json({ success: true, data: dataResponse }) 
  } catch (error) {
    return res.json({ success: false, data: error })
  }
}

exports.tambah_device = async function (req, res) {
  try {
    dataPost = {
      'nama_device': req.body.nama_device,
      'macaddress_device': req.body.mac,
      'jenis_device':  req.body.jenis,
      'status_device': 'ON'
    }
    
    dataResponse = await user.updateOne({owner: req.body.owner, "lahan.guidLahan": req.body.guid_lahan},
      { 
        $push: { 'lahan.$[].list_grup.$[].list_zona.$[id].list_device': dataPost} 
    },
      { arrayFilters: [{ 'id.guid_zona': req.body.guid_zona}]
    })

    return res.json({ success: true, data: dataResponse }) 
  } catch (error) {
    return res.json({ success: false, data: error })
  }
}

exports.tambah_setting = async function(req,res) {
  try {
    const owner = req.body.owner
    const guid_lahan = req.body.guid_lahan
    const setting = req.body.setting
    const tipe = req.body.tipe
    const guid_zona = req.body.guid_zona

    const dataResponse = await user.updateOne({owner: owner, "lahan.guidLahan": guid_lahan},
    {
      $set: {
        'lahan.$[].list_grup.$[].list_zona.$[zona].setting': setting,
        'lahan.$[].list_grup.$[].list_zona.$[zona].tipe_zona': tipe
      }
    },
    { 
      arrayFilters: [{ 'zona.guid_zona': guid_zona}]
    })

    // console.log(owner, guid_lahan, setting, tipe, guid_zona)
    return res.json({ success: true, data: dataResponse })
  } catch (error) {
    
  }
}

exports.tambah_schedule = async function (req, res) {
  try {
    const id = req.body.owner
    const recur = req.body.recur
    const mac = req.body.mac
    const day = req.body.day
    const repeat = req.body.repeat
    const duration = req.body.duration
    const hour = req.body.hour
    const minute = req.body.minute
    const zona = req.body.guid_zona
    const deskripsi = req.body.desk
    let config = req.body.config
    let setting = req.body.setting
    let tipe_zona = req.body.tipe

    // console.log(config)

    dataPost = {
      'macaddress_device': mac,
      'guid_schedule': uuid(),
      'timestamp': new Date(),
      'day': day,
      'recur': recur,
      'repeat': repeat,
      'deskripsi': deskripsi,
      'duration': duration,
      'hour': hour,
      'minute': minute,
      'status': 'ON'
    }
    
    dataResponse = await user.updateOne({owner: req.body.owner, "lahan.guidLahan": req.body.guid_lahan},
      {
        $set: {
          'lahan.$[].list_grup.$[].list_zona.$[id].setting': setting,
          'lahan.$[].list_grup.$[].list_zona.$[id].tipe_zona': tipe_zona
        },
        $push: { 
          'lahan.$[].list_grup.$[].list_zona.$[id].schedule':  dataPost
        } 
      },
      { arrayFilters: [{ 'id.guid_zona': zona}]
    })

      const zona_data = await user.aggregate([
        {$unwind: '$lahan'},
        {$unwind: '$lahan.list_grup'},
        {
          $match: {'lahan.list_grup.macaddress_solenoid': mac}
        },
        {
            $project: {
              guid_zona: '$lahan.list_grup.list_zona.guid_zona',
              list_zona: '$lahan.list_grup.list_zona'
          }},
          {$unwind: '$list_zona'},
          { $match: {'list_zona.guid_zona': zona}} 
      ]).toArray()

    if (zona_data.length > 0){
      let pubmessage = Array(zona_data[0].guid_zona.length+2).join('1')
      const index = zona_data[0].guid_zona.findIndex(x => x == zona_data[0].list_zona.guid_zona)
      const namaZona = zona_data[0].list_zona.nama_zona
      let hari = ""
      let pubmsg = ''

      pubmessage = pubmessage.replaceAt(0, '0')
      pubmessage = pubmessage.replaceAt(index+1, '0')
      // console.log(mac)

      if (tipe_zona == '3') {
        pubmessage = pubmessage.concat('#', setting*60000)
        try {
          // console.log(chenel)
          // chenel.publish('amq.topic', 'setting_receiver', Buffer.from(pubmessage))
          // console.log(pubmessage)
        } catch (error) {
          // console.log(error)
          // console.log(chenel)
        }
      } else {
        pubmessage = pubmessage.concat('#1000')
      }
      // console.log(pubmsg)

      if (config == 'weekly') {
        day.forEach(element => {
          hari += ','+element
        });
        hari = hari.slice(1)
        pubmsg = id+namaZona+'@'+mac+'@'+pubmessage+'@'+recur+'@'+repeat+'@'+duration+'@'+hour+'@'+minute+'@'+config+'@'+hari+'@'+namaZona
      } else {
        pubmsg = id+namaZona+'@'+mac+'@'+pubmessage+'@'+recur+'@'+repeat+'@'+duration+'@'+hour+'@'+minute+'@'+config+'@'+namaZona
      }

      // console.log(pubmsg)

      try {
        // console.log(chenel)
        console.log(pubmsg)
        chenel.publish('amq.topic', 'setting_receiver', Buffer.from(pubmsg))
      } catch (error) {
        console.log(error)
        // console.log(chenel)
      }

    } else {
      
    }

    return res.json({ success: true, data: dataResponse }) 
  } catch (error) {
    // console.log(error)
    return res.json({ success: false, data: error })
  }
}

exports.set_status = async function (req, res) {
  try {
    dataResponse = await user.updateOne({owner: req.body.owner, "lahan.guid_lahan": req.body.guid_lahan},
      { 
        $set: { 
          'lahan.$[].list_grup.$[].list_zona.$[].list_device.$[device].status_device':  req.body.status
        } 
      },
      { arrayFilters: [{ 'device.macaddress_device': req.body.mac}]
    })
    return res.json({ success: true, data: dataResponse })
  } catch (error) {
    return res.json({ success: false, data: error })
  }  
}

exports.tampil_lahan_owner = async function (req, res) {
  const inputOwner = req.body.owner

  await user.aggregate([
    { $unwind: '$lahan' },
    {
        $match: {owner: inputOwner}
    },
    {
        $project: { 
              nama_lahan: '$lahan.nama_lahan',
              guid_lahan: '$lahan.guidLahan'
            }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}

exports.tampil_grup_lahan = async function (req, res) {
  const inputOwner = req.body.owner
  const guid_lahan = req.body.guid_lahan

  await user.aggregate([
    { $unwind: '$lahan' },
    { $unwind: '$lahan.list_grup' },
    {
        $match: { $and: [{owner: inputOwner}, {'lahan.guidLahan': guid_lahan}] }
    },
    {
        $project: { 
              nama_group: '$lahan.list_grup.nama_group',
              guid_group: '$lahan.list_grup.guid_group'
            }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}

exports.tampil_zona_grup = async function (req, res) {
  const inputOwner = req.body.owner
  const guid_grup = req.body.guid_grup

  await user.aggregate([
    { $unwind: '$lahan' },
    { $unwind: '$lahan.list_grup' },
    { $unwind: '$lahan.list_grup.list_zona' },
    {
        $match: { $and: [{owner: inputOwner}, {'lahan.list_grup.guid_group': guid_grup}] }
    },
    {
        $project: { 
              nama_zona: '$lahan.list_grup.list_zona.nama_zona',
              guid_zona: '$lahan.list_grup.list_zona.guid_zona'
            }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}
exports.tampil_data_zona = async function (req, res) {
  const inputOwner = req.body.owner
  const guid_zona = req.body.guid_zona

   await user.aggregate([
    { $unwind: '$lahan' },
    { $unwind: '$lahan.list_grup' },
    { $unwind: '$lahan.list_grup.list_zona' },
    {
        $match: { $and: [{owner: inputOwner}, {'lahan.list_grup.list_zona.guid_zona': guid_zona}] }
    },
    {
        $project: { 
              guid_zona: '$lahan.list_grup.list_zona.guid_zona',
              macaddress_device: '$lahan.list_grup.macaddress_solenoid'
           }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}
exports.tampil_schedule_byzona = async function (req, res) {
  const inputOwner = req.body.owner
  const guid_zona = req.body.guid_zona

  await user.aggregate([
    { $unwind: '$lahan' },
    { $unwind: '$lahan.list_grup' },
    { $unwind: '$lahan.list_grup.list_zona' },
    {
        $match: { $and: [{owner: inputOwner}, {'lahan.list_grup.list_zona.guid_zona': guid_zona}] }
    },
    {
        $project: { 
              list_schedule: '$lahan.list_grup.list_zona.schedule'
           }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}

exports.tampil_semua_schedule = async function (req, res) {
  const inputOwner = req.body.owner

  await user.aggregate([
    { $unwind: '$lahan' },
    { $unwind: '$lahan.list_grup' },
    { $unwind: '$lahan.list_grup.list_zona' },
    {
        $match: { $and: [{owner: inputOwner}] }
    },
    {
        $project: {
              nama_zona: '$lahan.list_grup.list_zona.nama_zona',
              list_schedule: '$lahan.list_grup.list_zona.schedule'
           }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}

exports.tampil_data_debit = async function (req, res) {
  const inputMac = req.body.mac

  await db_water.find({macaddress_device: inputMac}).sort({ $natural: -1 }).limit(12)
  .toArray(function (err, result) {
    if (err) {
      return res.json({ success: false, data: err })
    } else {
      return res.json({ success: true, data: result })
    }
  })
}

exports.tampil_data_soil = async function (req, res) {
  const inputOwner = req.body.mac

  await db_soil.find({macaddress_device: inputOwner}).sort({ $natural: -1 }).limit(12)
  .toArray(function (err, result) {
    if (err) {
      return res.json({ success: false, data: err })
    } else {
      return res.json({ success: true, data: result })
    }
  })
}

exports.get_soil_mac = async function (req, res) {
  const inputOwner = req.body.owner

  await user.aggregate([
    { $unwind: '$lahan' },
    { $unwind: '$lahan.list_grup' },
    { $unwind: '$lahan.list_grup.list_zona' },
    { $unwind: '$lahan.list_grup.list_zona.list_device' },
    {
        $match: { $and: [{owner: inputOwner}, {'lahan.list_grup.list_zona.list_device.jenis_device': 'Soil'}] }
    },
    {
        $project: {
              zona: '$lahan.list_grup.list_zona.nama_zona',
              macaddress_device: '$lahan.list_grup.list_zona.list_device.macaddress_device'
           }
    }
    ]).toArray(function (err, result) {
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}

exports.get_water_mac = async function (req, res) {
  
}

exports.register_user = async function (req, res) {

    const salt = ""
    const data = {
      owner: req.body.owner,
      username: req.body.username,
      password: md5(req.body.password + salt),
      alamat: req.body.alamat,
      lahan: []
    }

    await user.insertOne(data, function (err, result){
      if (err) {
        return res.json({ success: false, data: err })
      } else {
        return res.json({ success: true, data: result })
      }
    })
}

String.prototype.replaceAt = function(index, replacment) {
  return this.substr(0, index) + replacment + this.substr(index+replacment.length)
}
