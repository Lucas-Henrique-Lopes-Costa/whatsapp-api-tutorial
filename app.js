const fetch = require('node-fetch');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(fileUpload({
  debug: false
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LocalAuth()
});

client.on('message', msg => {
  if (msg.body != '') {
    // Pipefy
    let url = 'https://api.pipefy.com/graphql';
      
    // GET DATA
    const optionsR = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDIxOTk5MjMsImVtYWlsIjoiZHJtYXJjb3R1bGlvQGhvdG1haWwuY29tIiwiYXBwbGljYXRpb24iOjMwMDIzMDE3Mn19.OOY7pe78F3T4rQ4jzOmxmMowXSJTy1COii0EimH_9gCOM9D3iXKb1tKD3Se7q-8DHea30NTSqnNmgWp87QS72w'
      },
      body: JSON.stringify({
        query:
          `
          {
            cards(pipe_id: 302989282) {
              edges {
                node {
                  id
                  current_phase {
                    name
                    id
                  }
                  fields {
                    value
                  }
                  child_relations {
                    cards {
                      title
                      current_phase {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
          `
      })
    };

    fetch(url, optionsR)
      .then(res => res.json())
      .then(data => {
        // Contato WhatsApp com o responsável
        for (let index = 0; index < data.data.cards.edges.length; index++) {
          const phase = data.data.cards.edges[index].node.current_phase.name;
          const name = data.data.cards.edges[index].node.fields[0].value.split(" ")[0];
          const number = "55" + data.data.cards.edges[index].node.fields[2].value.slice(4,6) + data.data.cards.edges[index].node.fields[2].value.slice(8).replace("-", "");
          let dataNumber = number.includes('@c.us') ? number : `${number}@c.us`;    

          if(phase == "Contato em WhatsApp"){
            let dataMessage = `Oi, ${name}, tudo bem?`;

            console.log("Enviando para: " + dataNumber)
            console.log("Mensagem: " + dataMessage)
            console.log("\n")

            setTimeout(function() {
              client.sendMessage(dataNumber, dataMessage);
            },1000 + Math.floor(Math.random() * 1000));
            
            // CHANGE
            const id = data.data.cards.edges[index].node.id;
            
            const optionsPhase = {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDIxOTk5MjMsImVtYWlsIjoiZHJtYXJjb3R1bGlvQGhvdG1haWwuY29tIiwiYXBwbGljYXRpb24iOjMwMDIzMDE3Mn19.OOY7pe78F3T4rQ4jzOmxmMowXSJTy1COii0EimH_9gCOM9D3iXKb1tKD3Se7q-8DHea30NTSqnNmgWp87QS72w'
              },
              body: JSON.stringify({
                query:
                  `
                  mutation {
                    moveCardToPhase(input: { card_id: "${id}", destination_phase_id: "318591630"}){
                      card{
                        id
                      }
                    }
                  }
                  `
              })
            };

            fetch(url, optionsPhase)
            .then(res => res.json())
            .then(data => { console.log("Fase mudada") })
            .catch(err => console.error('error:' + err));
          }

          if(phase == "Marcados"){
            let dataMessage = `Ok, ${name}, confirmamos sua consulta! Agradecemos pela atenção, vamos entrar em contato em breve para te lembrar 😉`;

            console.log("Enviando para: " + dataNumber)
            console.log("Mensagem: " + dataMessage)
            console.log("\n")

            setTimeout(function() {
              client.sendMessage(dataNumber, dataMessage);
            },1000 + Math.floor(Math.random() * 1000));
            
            // CHANGE
            const id = data.data.cards.edges[index].node.id;
            
            const optionsPhase = {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDIxOTk5MjMsImVtYWlsIjoiZHJtYXJjb3R1bGlvQGhvdG1haWwuY29tIiwiYXBwbGljYXRpb24iOjMwMDIzMDE3Mn19.OOY7pe78F3T4rQ4jzOmxmMowXSJTy1COii0EimH_9gCOM9D3iXKb1tKD3Se7q-8DHea30NTSqnNmgWp87QS72w'
              },
              body: JSON.stringify({
                query:
                  `
                  mutation {
                    moveCardToPhase(input: { card_id: "${id}", destination_phase_id: "318591631"}){
                      card{
                        id
                      }
                    }
                  }
                  `
              })
            };

            fetch(url, optionsPhase)
            .then(res => res.json())
            .then(data => { console.log("Fase mudada") })
            .catch(err => console.error('error:' + err));
          }

          if(phase == "Agradecimento"){
            let dataMessage = `Olá!, ${name}! Agradecemos sua consulta hoje! Queremos saber o que você achou!! Avalie nosso atendimento: https://drmarcotulio.github.io/avaliacao/`;

            console.log("Enviando para: " + dataNumber)
            console.log("Mensagem: " + dataMessage)
            console.log("\n")

            setTimeout(function() {
              client.sendMessage(dataNumber, dataMessage);
            },1000 + Math.floor(Math.random() * 1000));
            
            // CHANGE
            const id = data.data.cards.edges[index].node.id;
            
            const optionsPhase = {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDIxOTk5MjMsImVtYWlsIjoiZHJtYXJjb3R1bGlvQGhvdG1haWwuY29tIiwiYXBwbGljYXRpb24iOjMwMDIzMDE3Mn19.OOY7pe78F3T4rQ4jzOmxmMowXSJTy1COii0EimH_9gCOM9D3iXKb1tKD3Se7q-8DHea30NTSqnNmgWp87QS72w'
              },
              body: JSON.stringify({
                query:
                  `
                  mutation {
                    moveCardToPhase(input: { card_id: "${id}", destination_phase_id: "318615548"}){
                      card{
                        id
                      }
                    }
                  }
                  `
              })
            };

            fetch(url, optionsPhase)
            .then(res => res.json())
            .then(data => { console.log("Fase mudada") })
            .catch(err => console.error('error:' + err));
          }
        }
        
        // Lembrete do paciente
        const optionsP = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDIxOTk5MjMsImVtYWlsIjoiZHJtYXJjb3R1bGlvQGhvdG1haWwuY29tIiwiYXBwbGljYXRpb24iOjMwMDIzMDE3Mn19.OOY7pe78F3T4rQ4jzOmxmMowXSJTy1COii0EimH_9gCOM9D3iXKb1tKD3Se7q-8DHea30NTSqnNmgWp87QS72w'
          },
          body: JSON.stringify({
            query:
              `
              {
                cards(pipe_id: "302989283") {
                  edges {
                    node {
                      id
                      title
                      current_phase {
                        name
                      }
                      parent_relations {
                        cards {
                          title
                          fields {
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }      
              `
          })
        };

        fetch(url, optionsP)
          .then(res => res.json())
          .then(data => {
            for (let index = 0; index < data.data.cards.edges.length; index++) {
              const phase = data.data.cards.edges[index].node.current_phase.name;
              const nameR = data.data.cards.edges[index].node.parent_relations[0].cards[0].title.split(" ")[0];
              const nameP = data.data.cards.edges[index].node.title.split(" ")[0];
              const number = 55 + data.data.cards.edges[index].node.parent_relations[0].cards[0].fields[2].value.slice(4,6) + data.data.cards.edges[0].node.parent_relations[0].cards[0].fields[2].value.slice(8).replace("-", "");
              let dataNumber = number.includes('@c.us') ? number : `${number}@c.us`;    

              switch (phase) {
                case "Lembrete":
                  let dataMessage = `Oi, ${nameR}, tudo bem? Venho confirmar a consulta do ${nameP} hoje, está tudo ok?`;
                
                  console.log("Enviando para: " + dataNumber)
                  console.log("Mensagem: " + dataMessage)
                  console.log("\n")
          
                  setTimeout(function() {
                    client.sendMessage(dataNumber, dataMessage);
                  },1000 + Math.floor(Math.random() * 1000));

                  // CHANGE
                  const id = data.data.cards.edges[index].node.id;
                  
                  const optionsPhase = {
                    method: 'POST',
                    headers: {
                      accept: 'application/json',
                      'content-type': 'application/json',
                      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDIxOTk5MjMsImVtYWlsIjoiZHJtYXJjb3R1bGlvQGhvdG1haWwuY29tIiwiYXBwbGljYXRpb24iOjMwMDIzMDE3Mn19.OOY7pe78F3T4rQ4jzOmxmMowXSJTy1COii0EimH_9gCOM9D3iXKb1tKD3Se7q-8DHea30NTSqnNmgWp87QS72w'
                    },
                    body: JSON.stringify({
                      query:
                        `
                        mutation {
                          moveCardToPhase(input: { card_id: "${id}", destination_phase_id: "318594860"}){
                            card{
                              id
                            }
                          }
                        }
                        `
                    })
                  };

                  fetch(url, optionsPhase)
                  .then(res => res.json())
                  .then(data => { console.log("Fase mudada") })
                  .catch(err => console.error('error:' + err));
                  break;
              
                default:
                  break;
              }
            }
          })
          .catch(err => console.error('error:' + err));
      })
      .catch(err => console.error('error:' + err));
  }
});

client.initialize();

// Socket IO
io.on('connection', function(socket) {
  socket.emit('message', 'Conectando...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code recebido, abra seu whatsapp e leia!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp está pronto!');
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp está autenticado!');
    console.log('AUTHENTICATED');
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is desconectado!');
    client.destroy();
    client.initialize();
  });
});


const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Send media
app.post('/send-media', async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  // const media = MessageMedia.fromFilePath('./image-example.png');
  // const file = req.files.file;
  // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

const findGroupByName = async function(name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat => 
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = req.body.id;
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Clearing message on spesific chat
app.post('/clear-message', [
  body('number').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  const chat = await client.getChatById(number);
  
  chat.clearMessages().then(status => {
    res.status(200).json({
      status: true,
      response: status
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  })
});

server.listen(port, function() {
  console.log('App running on *: ' + port);
});
