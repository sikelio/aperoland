ALTER TABLE `events` ADD `date` date NULL, ADD `time` time NULL AFTER `date`, ADD `duration` int(11) NULL AFTER `time`;
