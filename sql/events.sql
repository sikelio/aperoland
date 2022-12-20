-- Adminer 4.8.1 MySQL 8.0.30 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `idEvent` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `description` text,
  `uuid` varchar(100) NOT NULL,
  PRIMARY KEY (`idEvent`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2022-12-20 23:31:35
