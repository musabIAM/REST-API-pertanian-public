let db = require('../app').db;
let users = db.collection('A1EC19E0A2');
let MD5 = require('md5')
let salt = ''
exports.login = async function (req, res) {
  var username = req.body.username
  var pass = req.body.pass
  var passwordMD5 = MD5(pass + salt)
  users.findOne({"username": username}, function (err, result){
    if (err) {
      return res.json({ success: false, data: err })
    }else{
      if(result != null){
        if (result.username === username) {
          if (result.password === passwordMD5) {
            try {
              dataResult = {
                'owner': result.owner,
                'username': result.username,
                'alamat': result.alamat
              }
              return res.json({ success: true, data: dataResult })
            } catch (error) {
              return res.json({ success: false, data: "result kantin tidak ada, terjadi error " + error })
            }
          }else{         
            return res.json({ success: false, data: "Sandi Anda Salah" })
          }
        } else {
          return res.json({ success: false, data: "User Tidak Di Temukan" })
        }
      } else {
        return res.json({ success: false, data: "Email Tidak Di Temukan" })
      }
    }
  })
}