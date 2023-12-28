#!/bin/bash

# Usage: deploy.sh <key_pair_path> <instance_ip> <process_name>

# Check if all required parameters are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <key_pair_path> <instance_ip> <process_name>"
    exit 1
fi

KEY_PAIR="$1"
INSTANCE_IP="$2"
PROCESS_NAME="$3"

scp -i "$KEY_PAIR" -r ~/code/anon-chat/server.js ec2-user@"$INSTANCE_IP":~/app
scp -i "$KEY_PAIR" -r ~/code/anon-chat/package.json ec2-user@"$INSTANCE_IP":~/app
scp -i "$KEY_PAIR" -r ~/code/anon-chat/package-lock.json ec2-user@"$INSTANCE_IP":~/app
scp -i "$KEY_PAIR" -r ~/code/anon-chat/public ec2-user@"$INSTANCE_IP":~/app

# SSH into the EC2 instance and restart pm2
# first time
# ssh -i "$KEY_PAIR" ec2-user@"$INSTANCE_IP" "cd ~/app && npm i --production && pm2 start -f server.js"
# run pm2 startup on ec2 instance
ssh -i "$KEY_PAIR" ec2-user@"$INSTANCE_IP" "cd ~/app && npm i --production"
ssh -i "$KEY_PAIR" ec2-user@"$INSTANCE_IP" "pm2 restart $PROCESS_NAME"


