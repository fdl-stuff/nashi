# nashi
fdl frontend

## requirements

`NODE LTS`
`MYSQL`
`NGINX`

## note

for production i recommend using linux, personally i used ubuntu 20.04.1 but you can definitely make this work on windows too if that's your intention! If you are encountering any issues please report them ^_^

if you wanna use it properly you should look into setting up nginx like in [#11](https://github.com/fdl-stuff/nashi/issues/11)

and you will most likely encounter the error "ER_NOT_SUPPORTED_AUTH_MODE" but that's okay simply look into [#1](https://github.com/fdl-stuff/nashi/issues/1)

otherwise if you have any other questions or need information on something [#18](https://github.com/fdl-stuff/nashi/issues/18) might have your answer, if it doesn't simply create a new issue.

ON LINUX: if you are installing nodejs DONT install it through your package manager, that version is most likely outdated and incompatible. Use [tj/n](https://github.com/tj/n) or [NVM](https://github.com/nvm-sh/nvm#installing-and-updating)!
## default ports

`3306`: ringo (database)

`8484`: nashi (the website)

`4848`: image-server

## install

```bash
# nashi (frontend): #
git clone https://github.com/fdl-stuff/nashi/ nashi
cd nashi 
npm install
git submodule init && git submodule update

# use some editor to edit the sample.config.json to your liking and then change the name to config.json
# once you did that proceed with the rest :3

cd ..

# ringo (database):
git clone https://github.com/fdl-stuff/ringo/ ringo
cd ringo

# windows:
# on windows you can in theory execute the same command that is used for linux by finding your mysql bin folder,
# but usually its easier to just run it through a sql visual tool like mysql workbench 

# linux:
mysql -h localhost -u root ringo -p < full-preset.sql

cd ..

# image server:
# i had some issues installing sharp hmm my solution was to go into root acc and install it their but it was dumb, fuck that hoe.
git clone https://github.com/fdl-stuff/image-server image-server
cd image-server
npm install

# nodemon
# this is good if you want to work with the code but in production id look into making nashi a service
npm install nodemon --global
```

## starting it up
```bash
# ringo:
# this depends on your operating system so:

# windows:
# if this doesnt work your mysql service might be called something different like: MYSQL or MYSQL*insert your version*,
# to find your version type net start and look for some service starting with mysql.

# if you get access denied run the terminal as an administrator 
net start mysql80

# linux:
/usr/bin/mysql -u root -p

# nashi:
cd nashi
nodemon # alternatively you can also just do node .

# image-server:
cd image-server
nodemon # alternatively you can also just do node .
```

In production I'd look into using a linux service, I've created [#10](https://github.com/fdl-stuff/nashi/issues/10) explaining how you can create them! 
