-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: hsafi8.h.filess.io    Database: C237CA2_topsortjar
-- ------------------------------------------------------
-- Server version	8.0.36-28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing` (
  `billingID` int NOT NULL AUTO_INCREMENT,
  `memberID` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` enum('credit_card','debit_card') COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('completed','failed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'completed',
  `classID` int DEFAULT NULL,
  PRIMARY KEY (`billingID`),
  KEY `fk_billing_members1_idx` (`memberID`),
  KEY `fk_billing_class1_idx` (`classID`),
  CONSTRAINT `fk_billing_class1` FOREIGN KEY (`classID`) REFERENCES `classT` (`classID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_billing_members1` FOREIGN KEY (`memberID`) REFERENCES `members` (`memberID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing`
--

LOCK TABLES `billing` WRITE;
/*!40000 ALTER TABLE `billing` DISABLE KEYS */;
INSERT INTO `billing` VALUES (1,1,15.00,'Morning Yoga class fee','2025-07-26 07:16:10','credit_card','completed',NULL),(2,1,20.00,'Advanced Spin class fee','2025-07-26 07:16:10','debit_card','completed',2),(3,3,12.00,'Evening Yoga class fee','2025-07-26 07:16:11','credit_card','completed',NULL),(4,1,12.00,'Evening Yoga class fee (cancelled)','2025-07-26 07:16:11','credit_card','failed',NULL);
/*!40000 ALTER TABLE `billing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `bookingID` int NOT NULL AUTO_INCREMENT,
  `memberID` int NOT NULL,
  `classID` int NOT NULL,
  `booking_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `timeslot` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`bookingID`),
  KEY `fk_booking_members1_idx` (`memberID`),
  KEY `fk_booking_class1_idx` (`classID`),
  CONSTRAINT `fk_booking_class1` FOREIGN KEY (`classID`) REFERENCES `classT` (`classID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_members1` FOREIGN KEY (`memberID`) REFERENCES `members` (`memberID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (2,1,2,'2025-07-26 07:16:10','');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classT`
--

DROP TABLE IF EXISTS `classT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classT` (
  `classID` int NOT NULL AUTO_INCREMENT,
  `className` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `location` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`classID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classT`
--

LOCK TABLES `classT` WRITE;
/*!40000 ALTER TABLE `classT` DISABLE KEYS */;
INSERT INTO `classT` VALUES (2,'Advanced Spin','High intensity spin class','2023-11-01 17:00:00','2023-11-01 18:00:00',20.00,''),(15,'class3','dasd','2025-07-28 17:05:00','2025-07-28 17:05:00',1.00,'rp');
/*!40000 ALTER TABLE `classT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `country` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `capacity` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Downtown Fitness','789 Fitness Blvd','Suite 100','10001','USA','a.png',''),(2,'sadvaevae','2wefwfw','EQDWF','32131','V','b.png','0'),(3,'b',',kfk','321','312411','Singapore','c.png','1');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `memberID` int NOT NULL AUTO_INCREMENT,
  `memberName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('member','admin') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  PRIMARY KEY (`memberID`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'John Doe1','john@example.com','hashed_password1','123 Main St','555-1234','member'),(2,'Sarah Williams','sarah@example.com','hashed_password4','321 Elm St','555-3456','admin'),(3,'Mike Johnson','mike@example.com','hashed_password3','789 Pine Rd','555-9012','member'),(8,'user1','user1@user.com','cf7d4405661e272c141cd7b89f0ef5b367b27d2d','110C Punggol Field','94881315','member'),(9,'winnie','winnie@example.com','32c21ad2646d96301f8519ccf1738fc45c42d359','bukit batok','12345678','admin'),(12,'admintest1','admintest1@admintest1.com','5627eae21589bd7b45fdb2af54c7fb91be7c2a77','110C Punggol Field','94881315','admin'),(32,'hms','jas@gmail.com','7ce0359f12857f2a90c7de465f40a95f01cb5da9','edf344','3435045','admin'),(37,'jasmine','hsumyatsan@gmail.com','7ce0359f12857f2a90c7de465f40a95f01cb5da9','1298766','1234567','admin'),(39,'user2','user2@example.com','5f0ffc1267ffa9f87d28110d1a526438f23f5aae','bukit batok','11112222','member'),(40,'ht','ht_123@example.com','05c02ed31fc582fec0d35683c4e4503044f22cef','Singapore','123432','admin'),(41,'aung','aung@gmail.com','7ce0359f12857f2a90c7de465f40a95f01cb5da9','ddsfed','12333455','member');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `roomID` int NOT NULL AUTO_INCREMENT,
  `roomName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`roomID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (2,'Spin Room',15),(3,'abc',5),(4,'Spin Room',8),(8,'id99',911),(9,'abc2222',1);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-28 22:21:40
