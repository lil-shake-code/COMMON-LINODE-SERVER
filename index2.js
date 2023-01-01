import fetch from "node-fetch";
//const Client = require("ssh2").Client;
import { Client } from "ssh2";
import request from "request";

const API_KEY =
  "0b4e090d4f6f9eee91e496a4cafff9227cc662c5be635ba1f4225b18475f72c8";

function linodeStatusTillRunning() {
  // Set up the API endpoint, your API key, and the ID of the VM instance
  const apiEndpoint = "https://api.linode.com/v4";
  // Make a GET request to retrieve the status of the VM instance

  request.get(
    {
      url: "https://api.linode.com/v4/linode/instances/41289588",
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
      } else {
        console.log(response.statusCode, body);
        console.log(JSON.parse(body).status);
        if (JSON.parse(body).status == "provisioning") {
          //what if provisioning
          console.log(
            "it sstill in provisioning so we'll try after 60 seconds"
          );
          setTimeout(linodeStatusTillRunning, 60000); //try after 10
        } else if (JSON.parse(body).status == "running") {
          console.log("status is running");
          //now we good
          //ready to control SSH
        }
      }
    }
  );
}

linodeStatusTillRunning();
