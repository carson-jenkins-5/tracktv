mkdir -p tracktv/{frontend,backend}
cd tracktv
mkdir frontend/assets
mkdir backend
cd backend
npm init -y
npm install express cors body-parser
npm init -y
sudo apt update
npm init -y
apt install npm
npm init -y
npm install express cors body-parser
node server.js
nginx -v
sudo apt update && sudo apt install nginx -y
sudo systemctl restart nginx
sudo systemctl status nginx
sudo nano /etc/nginx/sites-available/tracktv
sudo ln -s /etc/nginx/sites-available/tracktv /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
sudo netstat -tulpn | grep :80
sudo ss -tulpn | grep :80
ls -lah /var/www/html
sudo rm -rf /var/www/html/*
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo systemctl restart nginx
ls -lah /var/www/html
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/tracktv
sudo systemctl restart nginx
sudo ss -tulpn | grep :80
sudo systemctl status nginx
sudo ss -tulpn | grep :3000
cd ~/tracktv/backend
node server.js
npm install -g pm2
pm2 start server.js --name tracktv-api
pm2 save
pm2 startup
sudo reboot
pm2 list
sudo systemctl status nginx
nslookup carsonjenkins.chickenkiller.com
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d carsonjenkins.chickenkiller.com
sudo systemctl restart nginx
sudo apt update && sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d carsonjenkins.chickenkiller.com
curl -I https://carsonjenkins.chickenkiller.com
cd ~/tracktv/backend
pm2 start server.js --name tracktv-api
pm2 save
pm2 startup
pm2 list
npm install express cors body-parser
pm2 restart all
sudo rm -rf /var/www/html/*
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo systemctl restart nginx
sudo rm -rf /var/www/html/*
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo systemctl restart nginx
npm install express cors body-parser
pm2 start server.js --name tracktv-api
pm2 save
sudo systemctl restart nginx
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo systemctl restart nginx
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo rm -rf /var/www/html/*
sudo systemctl restart nginx
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo systemctl restart nginx
sudo rm -rf /var/www/html/*
sudo systemctl restart nginx
sudo cp -r ~/tracktv/frontend/* /var/www/html/
sudo systemctl restart nginx
curl -X GET http://localhost:3000/backend/watchlist
pm2 start server.js --name tracktv-api
sudo reboot
sudo systemctl restart nginx
sudo apt update
sudo apt install sqlite3
npm install sqlite3
sudo apt install better-sqlite3
pm2 list
pm2 logs server
node server.js
cd /root/tracktv/backend
node server.js
npm install bcrypt
node server.js
npm install jsonwebtoken
node server.js
sudo lsof -i :3000
sudo kill -9 <818>
sudo kill -9 818
node server.js
sudo killall node
sudo lsof -i :3000
sudo pkill -f node
sudo lsof -i :3000
sudo kill -9 284204
sudo lsof -i :3000
sudo reboot
cd /root/tracktv/backend
node server.js
pm2 list
curl -X GET http://localhost:3000/
sudo lsof -i :3000
curl -X GET http://localhost:3000/backend/watchlist
sudo systemctl status nginx
sudo nginx -t
cd /root/tracktv/frontend
ls -lah
curl -X GET http://localhost:3000/
ls /root/tracktv/frontend
node server.js
cd /root/tracktv/backend
node server.js
ls /root/tracktv/backend
ls -l /root/tracktv/backend
pwd
cat /root/tracktv/backend/package.json
node /root/tracktv/backend/server.js
lsof -i :3000
DEBUG=* node server.js
lsof -i :3000
pm2 list
pm2 stop all
pm2 delete all
systemctl list-units --type=service | grep tracktv
lsof -i :3000
ls
node server.js
pm2 start server.js --name tracktv
