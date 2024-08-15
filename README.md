# WebSocketMorpion

## desc général
WebSocketMorpion est un morpion en ligne qui utilise du web socket pour réaliser la communication entre plusieurs clients.
Ce projet est de base la réalisation du tuto reactjs où l'objectif est d'apprendre à utiliser quelque outils que propose reactjs [lien](https://fr.legacy.reactjs.org/tutorial/tutorial.html).

## pourquoi ce projet 
Après avoir réaliser le tuto reactjs je me suis sentis seul d'y jouer, je voulais profiter de mon jeu avec une autre personne sauf que de jouer sur une seule page est pas pratique. c'est pourquoi j'ai sauté sur l'occasion pour réaliser une communication web-socket avec un server back qui aura pour rôle de communiquer la progression de la partie entre les clients.

## Installation
Il est important de noter qu'il est necessaire de lancer et de configurer le projet [WebSocketMorpion-back](https://github.com/TomPoupi/WebSocketMorpion-Back) pour faire fonctionner le jeu, le front n'est qu'un affichage du jeu.
Concernant la configuration du front il faut modifier l'address ip et le port ( conrespondant au backend) dans le fichier src/index.js ligne 13 en conservant le format suivant : ws://ip_serverBack:port_serverBack, par exemple : ws://localhost:3000

ensuite réalisez la commande :
```
npm install
npm start
```

pour lancer le front
