CREATE DATABASE ads;

DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `playerID` bigint(20) NOT NULL,
  `params` text NOT NULL,
  PRIMARY KEY  (`playerID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (707476257,'{\"name\":\"userabc\",\"curHP\":30,\"maxHP\":50,\"curMP\":50,\"maxMP\":50,\"gold\":50,\"xp\":50,\"level\":3,\"map\":\"LevelWorldMap\",\"lastX\":600,\"lastY\":400,\"class\":\"Hotshot\"}'),(536441591,'{\"name\":\"user456\",\"curHP\":10,\"maxHP\":10,\"curMP\":0,\"maxMP\":0,\"gold\":5,\"xp\":0,\"level\":1,\"map\":\"LevelWorldMap\",\"lastX\":0,\"lastY\":0,\"class\":\"Hotshot\"}');
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;
