CREATE TABLE `chat` (
  `idChat` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `idEvent` int NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `username` int NOT NULL,
  `message` varchar(255) COLLATE 'utf8mb4_general_ci' NOT NULL,
  FOREIGN KEY (`idEvent`) REFERENCES `events` (`idEvent`) ON DELETE CASCADE,
  FOREIGN KEY (`username`) REFERENCES `users` (`idUser`) ON DELETE CASCADE
) ENGINE='InnoDB' COLLATE 'utf8mb4_general_ci';

ALTER TABLE `chat` DROP FOREIGN KEY `chat_ibfk_2`;

ALTER TABLE `chat` CHANGE `username` `username` varchar(30) COLLATE 'utf8mb4_general_ci' NOT NULL AFTER `time`;

ALTER TABLE `chat` CHANGE `message` `message` text COLLATE 'utf8mb4_general_ci' NOT NULL AFTER `username`;
