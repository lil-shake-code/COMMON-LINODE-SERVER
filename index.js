import fetch from "node-fetch";
//const Client = require("ssh2").Client;
import { Client } from "ssh2";
import request from "request";
import crypto from "crypto";

var linodeId = null;
const API_KEY =
  "0b4e090d4f6f9eee91e496a4cafff9227cc662c5be635ba1f4225b18475f72c8";
const REGION = "ap-west"; // Replace with your desired region
const PLAN = "g6-nanode-1"; // Replace with your desired plan
const IMAGE = "linode/ubuntu20.04"; // Replace with your desired image

var LINODEIP = null;
var linodeLabel = "complicated_machine21"; //PLEASE CHANGE THIS
async function createLinode() {
  try {
    const response = await fetch("https://api.linode.com/v4/linode/instances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        region: REGION,
        root_pass: "pasSSword$123", ///CHANGE THIS
        type: PLAN,
        image: IMAGE,
        label: linodeLabel,
      }),
    });
    const data = await response.json();
    console.log(data);
    LINODEIP = data.ipv4[0];
    linodeId = data.id;
    linodeStatusTillRunning();
  } catch (e) {
    console.error(e);
    console.log("trying again");
    createLinode();
  }
}

function controlSSHfromHere() {
  //first create the key
  // Generate a new 2048-bit RSA key pair
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "der",
      cipher: "aes-256-cbc",
      passphrase: "my passphrase",
    },
  });

  console.log(keyPair.publicKey);
  console.log(keyPair.privateKey);

  //now lets make this linode happen with ssh accesss!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const conn = new Client();
  conn
    .on("ready", function () {
      console.log("Client :: ready");
      conn.exec("uptime", function (err, stream) {
        if (err) throw err;
        stream
          .on("close", function (code, signal) {
            console.log(
              "Stream :: close :: code: " + code + ", signal: " + signal
            );
            conn.end();
          })
          .on("data", function (data) {
            console.log("STDOUT: " + data);
          })
          .stderr.on("data", function (data) {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect({
      host: LINODEIP,
      port: 22,
      username: "root", //IDFK WHAT IM DOING BUT IT SEEMS TO WORK
      privateKey: keyPair.privateKey,
    });
}

//function to check if device is ready
function linodeStatusTillRunning() {
  // Set up the API endpoint, your API key, and the ID of the VM instance

  // Make a GET request to retrieve the status of the VM instance
  request.get(
    {
      url:
        "https://api.linode.com/v4/linode/instances/" +
        JSON.stringify(linodeId),
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    },
    (error, response, body) => {
      if (error) {
        console.error(error);
        console.log(
          "error came at this point when we were just making the get request"
        );
        linodeStatusTillRunning();
      } else {
        console.log(response.statusCode, body);
        console.log(JSON.parse(body).status);
        if (JSON.parse(body).status == "provisioning") {
          //what if provisioning
          console.log(
            "it sstill in provisioning so we'll try after 10 seconds"
          );
          setTimeout(linodeStatusTillRunning, 10000); //try after 10
        } else if (JSON.parse(body).status == "running") {
          console.log("status is running");
          //now we good
          //ready to control SSH
          controlSSHfromHere();
        } else {
          setTimeout(linodeStatusTillRunning, 10000); //try after 10
        }
      }
    }
  );
}
//
//
//
//
//
//MAIN CODE
createLinode();
