ALTER TABLE `users` CHANGE `spotifyAccessToken` `spotifyAccessToken` longtext COLLATE 'utf8mb4_general_ci' NULL AFTER `isConfirmed`;

CREATE TABLE `playlist` (
  `idPlaylist` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `idEvent` int NOT NULL,
  `playlistName` varchar(255) COLLATE 'utf8mb4_general_ci' NOT NULL,
  `id` int NOT NULL,
  FOREIGN KEY (`idEvent`) REFERENCES `events` (`idEvent`) ON DELETE CASCADE
) ENGINE='InnoDB' COLLATE 'utf8mb4_general_ci';
