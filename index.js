//MODÜLLER
const Discord = require("discord.js");
const db = require("quick.db");
const table = new db.table("Tickets");
//MODÜLLER SON

//ID'LER
let guildid = "990362728197681162" //Sunucu ID
let log = "1034532491207377081" //Log Kanal ID
let prefix = "mm." //Prefix
let modroles = "990363644174954496" //Moderatör Rol ID
let botrole = "993483386427539457" //Bot Rol ID
let ticketCategory = "990362728734556211" //Kategori ID
let token = "" //Bot Tokeni
//ID'LER SON

//BOT LOG
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`AKTİF: ${client.user.tag} \n\n Sunucu ID: ${guildid} \n Log Kanalı ID: ${log} \n Mod Rol ID: ${modroles} \n Bot Rol ID: ${botrole} \n Ticket Kategori ID: ${ticketCategory} \n Prefix: ${prefix}`)
  client.user.setActivity(`ArviS#0011`)
})
//BOT LOG SON

//TİCKET
client.on("message", async message => {
  
  if(message.channel.type === "dm"){
    const dbTable = new db.table("Tickets");
    if(message.author.bot) return;
    if(message.content.includes("@everyone") || message.content.includes("@here")) return message.author.send("> Everyone Yada Here'dan Bahsedemezsin")
    let active = await dbTable.get(`support_${message.author.id}`)
    let guild = client.guilds.cache.get("990362728197681162"); // !!BURAYA SUNUCU ID'Yİ TEKRAR GİRMEYİ UNUTMAYIN!!
    let channel, found = true;
    
    let user = await dbTable.get(`isBlocked${message.author.id}`);
    if(user === true || user === "true") return message.react("❌");
    
    if(active === null){
      active = {};
      let modrole = guild.roles.cache.get(modroles);
      let everyone = guild.roles.cache.get(guild.roles.everyone.id);
      let bot = guild.roles.cache.get(botrole);
      
      await dbTable.add("ticket", 1)
      let actualticket = await dbTable.get("ticket");
      channel = await guild.channels.create(`${message.author.username}-${message.author.discriminator}`, { type: 'text', reason: `ModMail Ticket Oluşturuldu *#${actualticket}*` });
      channel.setParent(ticketCategory);
      channel.setTopic(`#${actualticket} (Aç) | ${prefix}İşlem Tamamlanınca Ticketı Kapatın | Modmail For ArviS#0011`)
      channel.createOverwrite(modrole, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true,
        READ_MESSAGE_HISTORY: true
      });
      channel.createOverwrite(everyone, {
        VIEW_CHANNEL: false
      });
      channel.createOverwrite(bot, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true,
        READ_MESSAGE_HISTORY: true,
        MANAGE_MESSAGES: true
      })
      let author = message.author;
      const newTicket = new Discord.MessageEmbed()
	.setColor("03ff00").setAuthor(author.tag, author.avatarURL({dynamic: true}))
  .setDescription(`Yeni Ticket Oluşturuldu`)
	.addField("Ticket No", actualticket, true)
//TİCKET SON
	
//LOGLAR
      if(log){
	client.channels.cache.get(log).send({embed: newTicket})
      }
      const newChannel = new Discord.MessageEmbed()
        .setColor("00ffea")
        .setDescription(`Ticket, *No #${actualticket}* Oluşturuldu \n\n **Kullanıcı:** ${author} \n **ID:** ${author.id}`)
      await client.channels.cache.get(channel.id).send({embed:newChannel});
      message.author.send(`> Merhaba **${author.username}**, *Ticket #${actualticket}* Başarıyla Açıldı`)
      let logChannel = guild.channels.cache.get(log);
      logChannel.send({embed:newTicket})
      active.channelID = channel.id;
      active.targetID = author.id;
    }
    channel = client.channels.cache.get(active.channelID);
    var msg = message.content;
    var whatWeWant = msg.replace("@everyone", "[everyone]").replace("@here", `[here]`) 
  
    var isPaused = await dbTable.get(`suspended${message.author.id}`);
    var isBlocked = await dbTable.get(`isBlocked${message.author.id}`);
    if(isPaused === true){
    	return message.channel.send("> Üzgünüz Ancak Ticketınız Şu Anda Duraklatıldı, Destek Ekibi Duraklatmayı Kaldırdığında Size Mesaj Göndereceğiz")
    }
    if(isBlocked === true) return; 
    if(message.attachments.size > 0){
      let attachment = new Discord.MessageAttachment(message.attachments.first().url)
      const userQuery = new Discord.MessageEmbed()
	      .setColor("03ff00")
	      .setTitle(`Mesaj Alındı`)
        .setDescription(`${whatWeWant}`)
        .setImage(message.attachments.first().url)
        .setFooter(msg.author.id)
      message.react("<:tik:1035231831815106611>");
      client.channels.cache.get(active.channelID).send({embed:userQuery})
    } else {
      const userQuery = new Discord.MessageEmbed()
	      .setColor("03ff00")
	      .setTitle(`Mesaj Alındı`)
        .setDescription(`${whatWeWant}`)
        .setFooter(`${message.author.tag} • ${message.author.id} `)
        
      message.react("<:tik:1035231831815106611>");
      client.channels.cache.get(active.channelID).send({embed:userQuery})
    }
    await dbTable.set(`support_${message.author.id}`, active);
    await dbTable.set(`supportChannel_${active.channelID}`, message.author.id);
    return;
  }
  if(message.author.bot) return;
  var table = new db.table("Tickets");
  var support = await table.get(`supportChannel_${message.channel.id}`);
  if(support){
    var support = await table.get(`support_${support}`);
    let supportUser = client.users.cache.get(support.targetID);
    if(!supportUser) return message.channel.delete();
//LOGLAR SON
  
//CEVAP
    if(message.content.toLowerCase().startsWith(`${prefix}cevap`)){
      var isPause = await table.get(`suspended${support.targetID}`);
      let isBlock = await table.get(`isBlocked${support.targetID}`);
      if(isPause === true) return message.channel.send("> Bu Ticket Duraklatıldı, Devam Etmek İçin Ticketı Açın")
      if(isBlock === true) return message.channel.send("> Kullanıcı Engellendi, Ticketı Devam Ettirmek Veya Kapatmak İçin Engelini Kaldırın")
      var args = message.content.split(" ").slice(1)
      let msg = args.join(" ");
      message.react("<:tik:1035231831815106611>");
      const newReply = new Discord.MessageEmbed()
	      .setColor("03ff00").setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
        .setDescription(`${msg}`)
        .setFooter(`Yetkili Tarafından Cevap Verildi`)
        
      
	      
      if(message.attachments.size > 0){
        
        let attachment = new Discord.MessageAttachment(message.attachments.first().url)
        const newImageReply = new Discord.MessageEmbed()
	      .setColor("03ff00").setAuthor(message.author.username, author.avatarURL({dynamic: true}))
	      .setTitle(`${message.author}`)
        .setDescription(`${msg}`)
        .setImage(message.attachments.first().url)
        
        return supportUser.send({embed:newImageReply});
      } else {
        return supportUser.send({embed:newReply});
      }
    };
//CEVAP SON

//ACEVAP
    if(message.content.toLowerCase().startsWith(`${prefix}acevap`)){
      var isPause = await table.get(`suspended${support.targetID}`);
      let isBlock = await table.get(`isBlocked${support.targetID}`);
      if(isPause === true) return message.channel.send("> Bu Ticket Zaten Duraklatıldı, Devam Etmek İçin Ticketı Tekrar Açın")
      if(isBlock === true) return message.channel.send("> Kullanıcı Engellendi, Ticketı Devam Ettirmek Veya Kapatmak İçin Engelini Kaldırın")
      var args = message.content.split(" ").slice(1)
      let msg = args.join(" ");
      message.react("<:tik:1035231831815106611>");
      const anonReply = new Discord.MessageEmbed()
	      .setColor("00ffea")
	      .setTitle(`Moderatör Takımı`)
        .setDescription(`${msg}`)
        .setFooter(`Anonim Yetkili Tarafından Cevap Verildi`)
        
        return supportUser.send({embed:anonReply});
    };
//ACEVAP SON
  
//ÖBİTİR
    if(message.content.toLowerCase() === `${prefix}öbitir`){
      const closeWarn = new Discord.MessageEmbed()
      .setTitle(`Yetkili Takımı`)
      .setDescription(`Şimdi Bu Konuyu Sizin İçin Kapatacağız, İyi günler \n\n Her Hangi Bir **Sorunuz** Veya **Sorununuz** Olursa Bizimle İletişime Geçmekten Çekinmeyin`)
      .setFooter(`Özel Kapanış Mesajı`)
      
      message.react("<:tik:1035231831815106611>");
        return supportUser.send({embed: closeWarn})
    }
//ÖBİTİR SON

//DURDUR
    if(message.content.toLowerCase() === `${prefix}durdur`){
      var isPause = await table.get(`suspended${support.targetID}`);
      if(isPause === true || isPause === "true") return message.channel.send("> Bu Ticket Zaten Duraklatıldı, Devam Etmek İçin Ticketı Tekrar Açın")
      await table.set(`suspended${support.targetID}`, true);
      var suspend = new Discord.MessageEmbed()
      .setDescription(`⏸️・Bu Konu **Kilitlendi** ve **Askıya Alındı**. \n\n İptal Etmek İçin: \`${prefix}devam\``)
      .setColor("8c00ff")
      message.channel.send({embed: suspend});
      return client.users.cache.get(support.targetID).send("> Ticketınız Duraklatıldı, Devam Etmeye Hazır Olduğumuzda Size Bir Mesaj Göndereceğiz")
    };
//DURDUR SON

//DEVAM
    if(message.content.toLowerCase() === `${prefix}devam`){
      var isPause = await table.get(`suspended${support.targetID}`);
      if(isPause === null || isPause === false) return message.channel.send("Bu Ticket duraklatılmadı.");
      await table.delete(`suspended${support.targetID}`);
      var c = new Discord.MessageEmbed()
      .setDescription("▶️・Askıya Alınan Konunun **Kilidi Açıldı**")
      .setColor("8c00ff")
      message.channel.send({embed: c});
      return client.users.cache.get(support.targetID).send("> Selam! Ticketınız Artık Aktif Durumda");
    }
//DEVAM SON

//ENGELLE
    if(message.content.toLowerCase().startsWith(`${prefix}engelle`)){
    var args = message.content.split(" ").slice(1)
	  let reason = args.join(" ");
	  if(!reason) reason = `Belirtilmemiş`
	  let user = client.users.fetch(`${support.targetID}`); 
	  const blocked = new Discord.MessageEmbed()
		.setColor("ff0000")
		.setTitle("Kullanıcı Engellendi!")
		.addField("Kanal", `<#${message.channel.id}>`, true)
		.addField("Sebep", reason, true)
    
	  if(log){
	    client.channels.cache.get(log).send({embed: blocked})
	  }
      let isBlock = await table.get(`isBlocked${support.targetID}`);
      if(isBlock === true) return message.channel.send("Kullanıcı zaten engellenmiş.")
      await table.set(`isBlocked${support.targetID}`, true);
      var c = new Discord.MessageEmbed()
      .setDescription("⏸️・Kullanıcı ModMail'dan Engellendi, Devam Etmek İçin Ticketı Kapatabilir Veya Engelini Kaldırabilirsiniz")
      .setColor("ff0000")
      message.channel.send({embed: c});
      return;
    }
//ENGELLE SON
  
//BİTİR
    if(message.content.toLowerCase() === `${prefix}bitir`){
        var embed = new Discord.MessageEmbed()
        .setDescription(`Bu Ticket **10 Saniye** İçinde Silinecek... \n\n :lock:・Konu **Kilitlendi** Ve **Kapatıldı**`)
        .setColor("ff0000")
        message.channel.send({embed: embed})
        var timeout = 10000
        setTimeout(() => {end(support.targetID);}, timeout)
        const closedTicket = new Discord.MessageEmbed()
	      .setColor("ff0000")
	      .setTitle(message.channel.name)
        .setDescription(`Ticket **${message.author.tag}** Tarafından Kapatıldı`)
        let guild = client.guilds.cache.get(guildid);
        let logChannel = guild.channels.cache.get(log);
        logChannel.send({embed: closedTicket})
      }
      async function end(userID){
        table.delete(`support_${userID}`);
        let actualticket = await table.get("ticket");
        message.channel.delete()
        return client.users.cache.get(support.targetID).send(`> *#${actualticket} Numaralı* Ticketınız Kapatıldı! Yeni Bir Ticket Açmak İsterseniz, Bana Mesaj Atmaktan Çekinmeyin`)
      }
    };
})
//BİTİR SON

//BOT ETİKET CEVAP
client.on('message', async message =>{
  if(message.author.bot) return false;
  if(message.content.includes("@here") || message.content.includes("@everyone")) return false;
  if(message.mentions.has(client.user.id)){
    message.reply(`Yardım Menüsü İçin **${prefix}yardım**`)
  }
    
  
})
//BOT ETİKET CEVAP SON

//YARDIM
client.on('message', async message => {
  if(message.content.toLowerCase().startsWith(`${prefix}yardım`)){
        var embedd = new Discord.MessageEmbed()
          .addField(`${prefix}cevap`, `Ticketa Cevap Vermenizi Sağlar`, false)
          .addField(`${prefix}acevap`, `Ticketa Anonim Bir Şekilde Vevap Cermenizi Sağlar`, false)
          .addField(`${prefix}engelle`, `Kullanıcıyı Engellemenizi Sağlar`, false)
          .addField(`${prefix}engelkaldır`, `Engellenmiş Kullanıcının Wngelini Kaldırmanızı Sağlar`, false)
          .addField(`${prefix}durdur`, `Kullanıcıdan, Mesaj Almayı Durdurmanızı Sağlar`, false)
          .addField(`${prefix}devam`, `Ticketa Devam Edersiniz`, false)
          .addField(`${prefix}bitir`, `Ticketı Kapatmanızı Sağlar`, false)
          .addField(`${prefix}öbitir`, `Özel Bir Bitiriş Selamı Göndermenizi Sağlar`, false)
          .setColor("8c00ff")
          
        message.channel.send({embed: embedd})
      }
  
})
//YARDIM SON

//ENGEL KALDIR
client.on("message", async message => {
  if(message.content.toLowerCase().startsWith(`${prefix}engelkaldır`)){
    if(message.guild.member(message.author).roles.cache.has(modroles)){
      var args = message.content.split(" ").slice(1);
      client.users.fetch(`${args[0]}`).then(async user => {
      	let data = await table.get(`isBlocked${args[0]}`);
        if(data === true){
          await table.delete(`isBlocked${args[0]}`);
                return message.channel.send(`**${user.username}** - **(${user.id})** Adlı Kullanıcının ModMail Hizmetinden Engeli Başarıyla Kaldırıldı`);
        } else {
          return message.channel.send(`**${user.username}** - **(${user.id})** Şu Anda ModMail'dan Engellenemiyor`)
        }
            }).catch(err => {
              if(err) return message.channel.send("> Kullanıcı Bulunamadı");
            })
    } else {
      return message.channel.send("Sakin, Bunu Yapamazsın");
    }
  }  
})
//ENGEL KALDIR SON

client.login(token);









//ArviS#0011