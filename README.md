# nashi
fdl frontend

## requirements

`NODE LTS`
`MYSQL 8.0.20`

## install

nashi (frontend): 

```
git clone https://github.com/fdl-stuff/nashi/ nashi

cd nashi 

npm install
```

ringo (database):

```
git clone https://github.com/fdl-stuff/ringo/ ringo

cd ringo

# windows
# on windows you can in theory execute the same command that is used for linux by finding your mysql bin folder but usually its easier to just run it through a sql visual tool like mysql workbench

# linux
mysql -h localhost -u root ringo -p < full-preset.sql
```

image server:

```
git clone https://github.com/fdl-stuff/image-server image-server

cd image-server

npm install
```

*if nodemon didn't install with the packages do*
```
npm install nodemon --global
```

## starting it up

ringo:
```
# this depends on your operating system so:

windows:
# if this doesnt work your mysql service might be called something different like just mysql to check type net start and look for mysql and if you get access denied run it as an administrator
net start mysql80

linux: 
/usr/bin/mysql -u root -p
```

nashi:
```
cd nashi

nodemon
```

image-server:
```
cd image-server

nodemon
```
