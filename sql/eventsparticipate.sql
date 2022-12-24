-- Adminer 4.8.1 MySQL 8.0.30 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `eventsparticipate`;
CREATE TABLE `eventsparticipate` (
  `idEvent` int NOT NULL,
  `idUser` int NOT NULL,
  KEY `idEvent` (`idEvent`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `eventsparticipate_ibfk_3` FOREIGN KEY (`idEvent`) REFERENCES `events` (`idEvent`) ON DELETE CASCADE,
  CONSTRAINT `eventsparticipate_ibfk_4` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2022-12-24 10:00:56
