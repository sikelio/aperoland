SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `eventsparticipate`;
CREATE TABLE `eventsparticipate` (
  `idEvent` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  KEY `idEvent` (`idEvent`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `eventsparticipate_ibfk_3` FOREIGN KEY (`idEvent`) REFERENCES `events` (`idEvent`) ON DELETE CASCADE,
  CONSTRAINT `eventsparticipate_ibfk_4` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;