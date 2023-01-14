const { spawn } = require("child_process");
const os = require("os");

console.log(os.hostname());

const lh = os.hostname();
const LINODE_HOSTNAME = lh;
const command1 = spawn(
  "echo",
  [
    "2",
    "|",
    "sudo",
    "certbot",
    "certonly",
    "--standalone",
    "-d",
    LINODE_HOSTNAME,
    "lilshake@rocketnetworking.net",
  ],
  {
    shell: true,
  }
);

command1.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

command1.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

command1.on("close", (code) => {
  if (code === 0) {
    const command2 = spawn("cat", [">", "/etc/nginx/sites-available/default"], {
      shell: true,
      input: `server {
                listen 80;
                listen 443 ssl;
                server_name ${LINODE_HOSTNAME};
                ssl_certificate /etc/letsencrypt/live/${LINODE_HOSTNAME}/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/${LINODE_HOSTNAME}/privkey.pem;
                location / {
                    proxy_pass http://localhost:3000;
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade \$http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host \$host;
                    proxy_cache_bypass \$http_upgrade;
                }
            }
            `,
    });

    command2.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    command2.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    command2.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        const command3 = spawn("sudo", ["service", "nginx", "restart"], {
          shell: true,
        });
        command3.stdout.on("data", (data) => {
          console.log(`stdout: ${data}`);
        });
      }
    });
  }
});
