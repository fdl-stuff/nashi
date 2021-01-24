# nashi
fdl frontend

## requirements

`NODE LTS`
`MYSQL 8.0.20`
`NGINX`

## note

for production i recommend using linux, personally i used ubuntu 20.04.1 but you can definitely make this work on windows too if that's your intention! If you are encountering any issues please report them ^_^

also if you wanna use it properly you should look into setting up nginx like in #11

## default ports

`3306`: ringo (database)

`8484`: nashi (the website)

`4848`: image-server

## install

```
// ### nashi (frontend): ### 
git clone https://github.com/fdl-stuff/nashi/ nashi

cd nashi 

npm install

// #########################

cd ..

// ### ringo (database): ###

git clone https://github.com/fdl-stuff/ringo/ ringo

cd ringo

// windows:
/*  on windows you can in theory execute the same command that is used for linux by finding your mysql bin folder,
    but usually its easier to just run it through a sql visual tool like mysql workbench 
*/

// linux
mysql -h localhost -u root ringo -p < full-preset.sql

// #####################

cd ..

// ### image server: ###

git clone https://github.com/fdl-stuff/image-server image-server

cd image-server

npm install
// ###############

// ### nodemon ###

// only necessary if nodemon didn't install through npm install, to test this simply type nodemon in your terminal.

npm install nodemon --global
```

## starting it up
```
// ### ringo: ###

// this depends on your operating system so:

// windows:
/*  if this doesnt work your mysql service might be called something different like: MYSQL or MYSQL*insert your version*,
    to find your version type net start and look for some service starting with mysql
   
    if you get access denied run the terminal as an administrator 
*/

net start mysql80

// linux:

/usr/bin/mysql -u root -p

// ##############

// ### nashi: ###

cd nashi

nodemon

// #####################

cd ..

// ### image-server: ###

cd image-server

nodemon
```

or alternatively in production I'd look into using a linux service, I've created #10 explaining how you can create them! 
