CREATE TABLE `shoppinglistitems` (
  `idItem` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `idEvent` int NOT NULL,
  `item` varchar(100) COLLATE 'utf8mb4_general_ci' NOT NULL,
  `quantitie` int NULL,
  `unit` enum('Litre(s), Kilogramme(s), Bouteille(s), Paquet(s), Unité(s)') COLLATE 'utf8mb4_general_ci' NULL,
  FOREIGN KEY (`idEvent`) REFERENCES `events` (`idEvent`) ON DELETE CASCADE
) ENGINE='InnoDB' COLLATE 'utf8mb4_general_ci';

ALTER TABLE `shoppinglistitems` CHANGE `quantitie` `quantitie` int NOT NULL AFTER `item`, CHANGE `unit` `unit` varchar(30) COLLATE 'utf8mb4_general_ci' NOT NULL AFTER `quantitie`;
