const schedule = require('node-schedule'),
Pret = require('../models/pret'),
User = require('../models/user'),
Suspension = require('../models/suspension')

let i = 0
// une fonction executer chaque jour a 00:00:00 pour mettre la base a jour
 const j = schedule.scheduleJob("1 * * * * *",async  function () {
    const prets = await Pret.find({"pretStatut" :"reserver"})
    prets.map(async (pret) => {
    let tday = new Date()
    let reserveDate = new Date(pret.document_info.dateDePret)
    tday = Math.ceil(Math.abs((tday.getTime() - reserveDate.getTime() )  / (24 * 60 * 60 *1000)))
    console.log(tday)
    if(tday > 3){
       const user = await User.findById(pret.user_id.id)
       if(user.suspension_id)  return;
       user.avertissment += 1
       await user.save()
       if(user.avertissment >= 3){
           user.avertissment = 0;
           await user.save()
           const suspension = new Suspension({
               user :{
                   id: user._id,
                   numero : user.numero
               },
               motif : "Réserveation de plusieurs documents sans confimer le prêt",
               expireAt : undefined

           })
           user.suspension_id = suspension._id
           await suspension.save()
           await pret.remove()
           await user.save()
          console.log(suspension) 

            return;
       }
           
    }
   }) 
   return;
});