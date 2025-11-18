-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 19, 2025 at 06:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `libly_library`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `born_year` int(11) DEFAULT NULL,
  `died_year` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authors`
--

INSERT INTO `authors` (`id`, `name`, `bio`, `born_year`, `died_year`, `created_at`) VALUES
(1, 'J. K. Rowling', NULL, NULL, NULL, '2025-10-06 19:04:07'),
(2, 'George Orwell', NULL, NULL, NULL, '2025-10-06 19:04:07'),
(3, 'Jane Austen', NULL, NULL, NULL, '2025-10-06 19:04:07'),
(4, 'Suzanne Collins', NULL, NULL, NULL, '2025-10-06 19:04:07'),
(5, 'E. L. James', NULL, NULL, NULL, '2025-10-06 23:57:45'),
(7, 'Charlotte Brontë', NULL, NULL, NULL, '2025-10-07 00:44:58'),
(8, 'Emily Brontë', NULL, NULL, NULL, '2025-10-07 00:44:58'),
(9, 'Leo Tolstoy', NULL, NULL, NULL, '2025-10-07 00:45:18'),
(10, 'Margaret Mitchell', NULL, NULL, NULL, '2025-10-07 00:45:18'),
(11, 'J.R.R. Tolkien', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(12, 'J.K. Rowling', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(13, 'Frank Herbert', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(14, 'Patrick Rothfuss', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(15, 'George R.R. Martin', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(16, 'Brandon Sanderson', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(17, 'Joe Abercrombie', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(18, 'Orson Scott Card', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(19, 'Isaac Asimov', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(20, 'William Gibson', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(21, 'Andy Weir', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(22, 'Ernest Cline', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(23, 'Suzanne Collins', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(24, 'Jane Austen', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(25, 'Harper Lee', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(26, 'George Orwell', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(27, 'F. Scott Fitzgerald', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(28, 'Charlotte Brontë', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(29, 'Emily Brontë', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(30, 'J.D. Salinger', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(31, 'Aldous Huxley', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(32, 'Mark Twain', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(33, 'Herman Melville', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(34, 'Mary Shelley', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(35, 'Bram Stoker', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(36, 'Oscar Wilde', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(37, 'Louisa May Alcott', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(38, 'Stieg Larsson', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(39, 'Gillian Flynn', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(40, 'Dan Brown', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(41, 'Thomas Harris', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(42, 'Agatha Christie', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(43, 'Arthur Conan Doyle', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(44, 'Liane Moriarty', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(45, 'Paula Hawkins', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(46, 'Stephen King', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(47, 'Truman Capote', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(48, 'Daphne du Maurier', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(49, 'Dashiell Hammett', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(50, 'James M. Cain', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(51, 'Patricia Highsmith', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(52, 'Khaled Hosseini', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(53, 'Markus Zusak', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(54, 'Yann Martel', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(55, 'Paulo Coelho', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(56, 'Cormac McCarthy', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(57, 'Alice Sebold', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(58, 'Kathryn Stockett', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(59, 'Sara Gruen', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(60, 'John Green', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(61, 'Gail Honeyman', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(62, 'Kristin Hannah', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(63, 'Anthony Doerr', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(64, 'Sue Monk Kidd', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(65, 'Audrey Niffenegger', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(66, 'Tara Westover', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(67, 'Michelle Obama', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(68, 'Yuval Noah Harari', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(69, 'Anne Frank', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(70, 'Jon Krakauer', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(71, 'Daniel Kahneman', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(72, 'Walter Isaacson', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(73, 'Rebecca Skloot', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(74, 'Susan Cain', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(75, 'Paul Kalanithi', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(76, 'Stephenie Meyer', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(77, 'Veronica Roth', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(78, 'James Dashner', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(79, 'Stephen Chbosky', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(80, 'Jay Asher', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(81, 'Lois Lowry', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(82, 'S.E. Hinton', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(83, 'Madeleine L\'Engle', NULL, NULL, NULL, '2025-10-19 02:45:37'),
(84, 'George R. R. Martin', NULL, NULL, NULL, '2025-10-19 09:31:09'),
(85, 'S. E. Hinton', NULL, NULL, NULL, '2025-10-19 09:31:09'),
(86, 'J. D. Salinger', NULL, NULL, NULL, '2025-10-19 09:40:34');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `isbn_10` varchar(10) DEFAULT NULL,
  `isbn_13` varchar(13) DEFAULT NULL,
  `language_code` varchar(16) DEFAULT NULL,
  `page_count` int(11) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `publisher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `subtitle`, `description`, `isbn_10`, `isbn_13`, `language_code`, `page_count`, `release_date`, `publisher_id`, `cover_url`, `created_at`, `updated_at`) VALUES
(1, '1984', NULL, 'Set in the totalitarian superstate of Oceania, where the protagonist Winston Smith works for the Ministry of Truth, engaging in propaganda and historical revisionism under the omnipresent gaze of the Party and its leader, Big Brother. Winston\'s desire for individual freedom and truth leads him to a secret affair with Julia and his eventual connection with a resistance movement, but they are betrayed and arrested by the Thought Police. Winston is subjected to brutal torture and psychological manipulation in the Ministry of Love, which breaks his will, making him embrace the Party\'s slogans and love Big Brother.', NULL, NULL, 'en', 328, '1949-06-08', NULL, 'https://mediaunram.com/wp-content/uploads/2025/09/d4203d76-dfdb-4938-b735-a3bf55caa5f7.jpeg', '2025-10-06 19:04:07', '2025-10-19 19:16:35'),
(2, 'Pride and Prejudice', NULL, 'follows the intelligent Elizabeth Bennet as she navigates social expectations and finds love with the wealthy, proud Mr. Darcy. After initially disliking each other due to Darcy\'s condescension and Elizabeth\'s initial prejudice against him, they both undergo personal growth, overcoming their pride and prejudice to eventually marry. The story also features the Bennet sisters, their mother\'s relentless pursuit of wealthy husbands, and the satirical portrayal of English society in the early 19th century.', NULL, NULL, 'en', 279, '1813-01-28', NULL, 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/_4121.jpg', '2025-10-06 19:04:07', '2025-10-19 19:16:35'),
(3, 'Harry Potter and the Sorcerer\'s Stone', NULL, 'Harry, an orphaned boy who discovers on his eleventh birthday that he is a wizard. He is invited to Hogwarts School of Witchcraft and Wizardry, where he makes friends with Ron and Hermione and learns about his parents\' tragic deaths at the hands of the evil wizard Voldemort. The trio then embarks on a quest to protect the Sorcerer\'s Stone from Voldemort, who seeks it to regain immortality.', NULL, NULL, 'en', 309, '1997-06-26', NULL, 'https://perpustakaan.jakarta.go.id/catalog-dispusip/uploaded_files/sampul_koleksi/original/SumberElektronik/235688.jpeg', '2025-10-06 19:04:07', '2025-10-19 19:16:35'),
(4, 'The Hunger Games', NULL, 'Katniss Everdeen, a teen from the impoverished District 12, who volunteers to take her sister\'s place in the annual Hunger Games, a televised fight to the death where one child from each of Panem\'s 12 districts is forced to compete for survival. Along with the male tribute from her district, Peeta Mellark, Katniss must navigate the brutal Capitol and the treacherous arena, using her hunting skills and wit to survive and become the ultimate victor.', NULL, NULL, 'en', 374, '2008-09-14', NULL, 'https://ebooks.gramedia.com/ebook-covers/3172/big_covers/ID_GPU2013MTH04THGA_B_1.jpg', '2025-10-06 19:04:07', '2025-10-19 19:16:35'),
(5, 'Fifty Shades of Grey', NULL, 'When a wounded Christian Grey tries to entice a cautious Anastasia Steele back into his life, she demands a new arrangement before she will give him another chance. As the two begin to build trust and find stability, shadowy figures from Christian\'s past start to circle them, determined to destroy their hopes for a future together.', NULL, NULL, 'en', 514, '2015-02-13', NULL, 'https://otimages.com/Bookcover/3129/9780385363129.jpg', '2025-10-06 23:56:49', '2025-10-19 19:16:35'),
(7, 'Harry Potter and the Chamber of Secrets', NULL, 'The second instalment of boy wizard Harry Potter\'s adventures at Hogwarts School of Witchcraft and Wizardry, based on the novel by JK Rowling. A mysterious elf tells Harry to expect trouble during his second year at Hogwarts, but nothing can prepare him for trees that fight back, flying cars, spiders that talk and deadly warnings written in blood on the walls of the school.', NULL, NULL, 'en', 341, '1998-07-02', NULL, 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_360,c_scale,dpr_1.5/jackets/9781408855669.jpg', '2025-10-07 00:08:00', '2025-10-19 19:16:35'),
(8, 'Harry Potter and the Prisoner of Azkaban', NULL, 'Harry learns that Sirius Black, a dangerous prisoner, has escaped from Azkaban and is believed to be after him. As dementors guard Hogwarts, Harry uncovers the truth about his parents’ betrayal and learns Sirius’s true identity. The story introduces time travel, Animagi, and the complexity of good versus evil in unexpected ways.', NULL, NULL, 'en', 435, '1999-07-08', NULL, 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_360,c_scale,dpr_1.5/jackets/9781408855676.jpg', '2025-10-07 00:08:00', '2025-10-19 19:16:35'),
(9, 'Harry Potter and the Goblet of Fire', NULL, 'Hogwarts hosts the Triwizard Tournament, a deadly competition between three magical schools. Somehow, Harry’s name is mysteriously entered as a fourth champion. As he faces dragons, mermaids, and a deadly maze, Harry uncovers a dark plot that leads to the return of Lord Voldemort in physical form — marking the series’ shift into darker territory.', NULL, NULL, 'en', 734, '2000-07-08', NULL, 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_360,c_scale,dpr_1.5/jackets/9781408855683.jpg', '2025-10-07 00:10:42', '2025-10-19 19:16:35'),
(10, 'Harry Potter and the Order of the Phoenix', NULL, 'The Ministry of Magic refuses to believe Voldemort has returned, branding Harry a liar. At Hogwarts, a cruel new teacher, Dolores Umbridge, enforces strict control. Harry forms Dumbledore’s Army to train fellow students for the coming battle. Haunted by visions connected to Voldemort, Harry ultimately faces a devastating loss in the Department of Mysteries.', NULL, NULL, 'en', 870, '2003-06-21', NULL, 'https://perpustakaan.jakarta.go.id/catalog-dispusip/uploaded_files/sampul_koleksi/original/Monograf/231172.jpg', '2025-10-07 00:10:42', '2025-10-19 19:16:35'),
(11, 'Harry Potter and the Half-Blood Prince', NULL, 'As Voldemort’s power grows, Dumbledore begins teaching Harry about his enemy’s past, including Horcruxes — dark magical objects containing pieces of Voldemort’s soul. Meanwhile, Harry discovers an old Potions textbook belonging to the mysterious Half-Blood Prince. The book ends with shocking betrayal and tragedy atop the Astronomy Tower.', NULL, NULL, 'en', 607, '0000-00-00', NULL, 'https://cdn.gramedia.com/uploads/items/9780545582995.jpg', '2025-10-07 00:12:59', '2025-10-19 23:23:14'),
(12, 'Harry Potter and the Deathly Hallows', NULL, 'Harry, Ron, and Hermione set out to find and destroy the remaining Horcruxes, leaving Hogwarts behind. Their journey reveals the legend of the Deathly Hallows, three powerful magical objects. The story culminates in the Battle of Hogwarts, where Harry makes the ultimate sacrifice and faces Voldemort one final time. The series concludes with an epilogue showing the next generation of witches and wizards heading to Hogwarts.', NULL, NULL, 'en', 759, '2007-07-21', NULL, 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_360,c_scale,dpr_1.5/jackets/9781408855713.jpg', '2025-10-07 00:12:59', '2025-10-19 23:23:14'),
(13, 'Jane Eyre', NULL, 'An orphaned governess, Jane Eyre, falls in love with her mysterious employer, Mr. Rochester, who hides a dark secret in his mansion. It’s a story of independence, morality, and enduring love against the odds.', NULL, NULL, 'en', 545, '1847-10-16', NULL, 'https://ebooks.gramedia.com/ebook-covers/58362/image_highres/BLK_CJECB2020794449.jpg', '2025-10-07 00:40:02', '2025-10-19 23:23:14'),
(14, 'Wuthering Heights', NULL, 'Set on the Yorkshire moors, this gothic tale follows the obsessive and destructive love between Heathcliff and Catherine Earnshaw. Their passion transcends life and death, haunting generations of their families.', NULL, NULL, 'en', 96, '1847-12-01', NULL, 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_360,c_scale,dpr_1.5/jackets/9781847493217.jpg', '2025-10-07 00:40:02', '2025-10-19 23:23:14'),
(15, 'Anna Karenina', NULL, 'In imperial Russia, the married Anna Karenina falls into a doomed affair with the dashing Count Vronsky. Their romance defies societal norms, exploring the tension between passion, morality, and consequence.', NULL, NULL, 'en', 976, '1877-04-01', NULL, 'https://cdn.gramedia.com/uploads/product-metas/6kic2c1inn.jpg', '2025-10-07 00:43:25', '2025-10-19 23:23:14'),
(16, 'Gone with the Wind', NULL, 'Set during the American Civil War, Scarlett O’Hara’s fierce love for Ashley Wilkes — and later Rhett Butler — drives this sweeping saga of survival, pride, and heartbreak amid a collapsing world.', NULL, NULL, 'en', 896, '1936-06-30', NULL, 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781451635621/gone-with-the-wind-9781451635621_hr.jpg', '2025-10-07 00:43:25', '2025-10-19 23:23:14'),
(17, 'The Hobbit', NULL, 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep to whisk him away on an adventure.', NULL, NULL, 'en', 310, '1937-09-21', NULL, 'https://ebooks.gramedia.com/ebook-covers/40694/big_covers/ID_GPU2017MTH10THOB_B.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(18, 'The Fellowship of the Ring', NULL, 'The first volume of The Lord of the Rings, the greatest fantasy epic of all time, follows the hobbit Frodo Baggins as he begins his quest to destroy the One Ring.', NULL, NULL, 'en', 423, '1954-07-29', NULL, 'https://m.media-amazon.com/images/I/71Ep7UNeTtL._AC_UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(19, 'The Two Towers', NULL, 'Frodo and Sam continue their journey to Mordor with Gollum as their guide, while Aragorn, Legolas, and Gimli help defend Rohan and prepare for battle.', NULL, NULL, 'en', 352, '1954-11-11', NULL, 'https://perpustakaan.jakarta.go.id/catalog-dispusip/uploaded_files/sampul_koleksi/original/Monograf/242704.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(20, 'The Return of the King', NULL, 'The final volume sees the culmination of the quest as armies mass for war and Frodo reaches the fires of Mount Doom.', NULL, NULL, 'en', 416, '1955-10-20', NULL, 'https://m.media-amazon.com/images/I/71tDovoHA+L._UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(25, 'Dune', NULL, 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the \"spice\" melange.', NULL, NULL, 'en', 688, '1965-06-01', NULL, 'https://ashcliftonwriter.com/wp-content/uploads/2024/07/dunecover1.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(26, 'The Name of the Wind', NULL, 'Told in Kvothe\'s own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.', NULL, NULL, 'en', 662, '2007-03-27', NULL, 'https://m.media-amazon.com/images/I/91KI2bIJUgL._AC_UF1000,1000_QL80_.jpg', '0000-00-00 00:00:00', '2025-10-19 23:23:14'),
(27, 'A Game of Thrones', NULL, 'Long ago, in a time forgotten, a preternatural event threw the seasons out of balance. In a land where summers can last decades and winters a lifetime, trouble is brewing.', NULL, NULL, 'en', 694, '1996-08-01', NULL, 'https://m.media-amazon.com/images/I/71Jzezm8CBL._UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(28, 'The Way of Kings', NULL, 'Roshar is a world of stone and storms. Uncanny tempests of incredible power sweep across the rocky terrain.', NULL, NULL, 'en', 1007, '2010-08-31', NULL, 'https://m.media-amazon.com/images/I/717-lu7pTeL._UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(29, 'Mistborn: The Final Empire', NULL, 'For a thousand years the ash fell and no flowers bloomed. For a thousand years the Skaa slaved in misery and lived in fear. For a thousand years the Lord Ruler reigned with absolute power.', NULL, NULL, 'en', 541, '2006-07-17', NULL, 'https://m.media-amazon.com/images/I/811qBmIYTFL._AC_UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(30, 'The Blade Itself', NULL, 'Logen Ninefingers, infamous barbarian, has finally run out of luck. Caught in one feud too many, he\'s on the verge of becoming a dead barbarian.', NULL, NULL, 'en', 531, '2007-05-01', NULL, 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1747782133i/944073.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(31, 'Ender\'s Game', NULL, 'Andrew \"Ender\" Wiggin thinks he is playing computer simulated war games; he is, in fact, engaged in something far more desperate.', NULL, NULL, 'en', 324, '1985-01-15', NULL, 'https://m.media-amazon.com/images/I/71nr7G7Q+xL._AC_UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(32, 'Foundation', NULL, 'For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying.', NULL, NULL, 'en', 255, '1951-06-01', NULL, 'https://m.media-amazon.com/images/I/91ZYBjR+gYL._AC_UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(33, 'Neuromancer', NULL, 'Case was the sharpest data-thief in the matrix—until he crossed the wrong people and they crippled his nervous system, banishing him from cyberspace.', NULL, NULL, 'en', 271, '1984-07-01', NULL, 'https://m.media-amazon.com/images/I/712IyBosiNL._UF894,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(34, 'The Martian', NULL, 'Six days ago, astronaut Mark Watney became one of the first people to walk on Mars. Now, he\'s sure he\'ll be the first person to die there.', NULL, NULL, 'en', 369, '2014-02-11', NULL, 'https://m.media-amazon.com/images/I/41TOOuTLBNL._UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(35, 'Ready Player One', NULL, 'In the year 2045, reality is an ugly place. The only time teenage Wade Watts really feels alive is when he\'s jacked into the virtual utopia known as the OASIS.', NULL, NULL, 'en', 374, '2011-08-16', NULL, 'https://m.media-amazon.com/images/I/91FGDm7MfIL._AC_UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(38, 'To Kill a Mockingbird', NULL, 'The unforgettable novel of childhood in a sleepy Southern town and the crisis of conscience that rocked it.', NULL, NULL, 'en', 324, '1960-07-11', NULL, 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(40, 'The Great Gatsby', NULL, 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', NULL, NULL, 'en', 180, '1925-04-10', NULL, 'https://www.alvahnbeldinglibrary.org/site-assets/book-images/great-gatsby.jpg/@@images/image-800-c932e4295882c61cd0a35ceb92eff6e8.jpeg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(43, 'The Catcher in the Rye', NULL, 'The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield.', NULL, NULL, 'en', 277, '1951-07-16', NULL, 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(44, 'Brave New World', NULL, 'Aldous Huxley\'s profoundly important classic of world literature is a searching vision of an unequal, technologically-advanced future.', NULL, NULL, 'en', 268, '1932-01-01', NULL, 'https://upload.wikimedia.org/wikipedia/en/6/62/BraveNewWorld_FirstEdition.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(45, 'Animal Farm', NULL, 'A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress and justice.', NULL, NULL, 'en', 140, '1945-08-17', NULL, 'https://m.media-amazon.com/images/I/91Lbhwt5RzL.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(46, 'The Adventures of Huckleberry Finn', NULL, 'A nineteenth-century boy from a Mississippi River town recounts his adventures as he travels down the river with a runaway slave.', NULL, NULL, 'en', 224, '1884-12-10', NULL, 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781839641787/the-adventures-of-huckleberry-finn-9781839641787_hr.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(47, 'Moby-Dick', NULL, 'The saga of Captain Ahab and his monomaniacal pursuit of the white whale.', NULL, NULL, 'en', 654, '1851-10-18', NULL, 'https://images.penguinrandomhouse.com/cover/9780143105954', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(48, 'Frankenstein', NULL, 'Mary Shelley\'s timeless gothic novel presents the epic battle between man and monster at its greatest literary pitch.', NULL, NULL, 'en', 166, '1818-01-01', NULL, 'https://bukukita.com/babacms/displaybuku/88635_f.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(49, 'Dracula', NULL, 'When Jonathan Harker visits Transylvania to help Count Dracula purchase a London house, he makes horrifying discoveries about his client.', NULL, NULL, 'en', 418, '1897-05-26', NULL, 'https://ebooks.gramedia.com/ebook-covers/60965/image_highres/BLK_CDCB2021495187.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(50, 'The Picture of Dorian Gray', NULL, 'Written in his distinctively dazzling manner, Oscar Wilde\'s story of a fashionable young man who sells his soul for eternal youth and beauty is the author\'s most popular work.', NULL, NULL, 'en', 254, '1890-07-01', NULL, 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781625587534/the-picture-of-dorian-gray-9781625587534_hr.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(51, 'Little Women', NULL, 'Grown-up Meg, tomboyish Jo, timid Beth, and precocious Amy. The four March sisters couldn\'t be more different.', NULL, NULL, 'en', 449, '1868-09-30', NULL, 'https://perpustakaan.jakarta.go.id/catalog-dispusip/uploaded_files/sampul_koleksi/original/Monograf/229304.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(52, 'The Girl with the Dragon Tattoo', NULL, 'Harriet Vanger, a scion of one of Sweden\'s wealthiest families disappeared over forty years ago. Mikael Blomkvist is aided by the pierced, tattooed, punk computer hacker named Lisbeth Salander.', NULL, NULL, 'en', 465, '2005-08-01', NULL, 'https://www.thereallygoodbookshop.com.au/assets/images/product/1847245455_1.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(53, 'Gone Girl', NULL, 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne\'s fifth wedding anniversary. But Amy has disappeared.', NULL, NULL, 'en', 415, '2012-06-05', NULL, 'https://ebooks.gramedia.com/ebook-covers/19300/big_covers/ID_GPU2014MTH11GGYH_B_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(54, 'The Da Vinci Code', NULL, 'While in Paris on business, Harvard symbologist Robert Langdon receives an urgent late-night phone call: the elderly curator of the Louvre has been murdered.', NULL, NULL, 'en', 454, '2003-03-18', NULL, 'https://upload.wikimedia.org/wikinews/en/5/5e/Davinci_code.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(55, 'The Silence of the Lambs', NULL, 'A serial murderer known only by a grotesquely apt nickname—Buffalo Bill—is stalking women. FBI trainee Clarice Starling seeks the advice of the imprisoned Dr. Hannibal Lecter.', NULL, NULL, 'en', 338, '1988-01-01', NULL, 'https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_568,c_scale,dpr_1.5/jackets/9781839023699.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(56, 'And Then There Were None', NULL, 'Ten people, each with something to hide and something to fear, are invited to an isolated mansion on Indian Island by a host who fails to appear.', NULL, NULL, 'en', 264, '1939-11-06', NULL, 'https://perpustakaan.jakarta.go.id/catalog-dispusip/uploaded_files/sampul_koleksi/original/Monograf/206144.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(57, 'The Hound of the Baskervilles', NULL, 'Could the sudden death of Sir Charles Baskerville have been caused by the gigantic ghostly hound which is said to have haunted his family for generations?', NULL, NULL, 'en', 256, '1902-04-01', NULL, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Cover_%28Hound_of_Baskervilles%2C_1902%29.jpg/500px-Cover_%28Hound_of_Baskervilles%2C_1902%29.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(58, 'Murder on the Orient Express', NULL, 'Just after midnight, a snowdrift stops the Orient Express in its tracks. The luxurious train is surprisingly full, but by morning there is one passenger fewer.', NULL, NULL, 'en', 256, '1934-01-01', NULL, 'https://otimages.com/Bookcover/3501/9780062073501.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(59, 'Big Little Lies', NULL, 'Sometimes it\'s the little lies that turn out to be the most lethal. A murder... A tragic accident... Or just parents behaving badly?', NULL, NULL, 'en', 460, '2014-07-29', NULL, 'https://www.penguinrandomhouse.co.za/sites/penguinbooks.co.za/files/styles/jacket-large/public/cover/9781405916363.jpg?itok=bsQE5UqT', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(60, 'The Girl on the Train', NULL, 'Rachel takes the same commuter train every morning. Every day she rattles down the track, flashes past a stretch of cozy suburban homes, and stops at the signal that allows her to daily watch the same couple.', NULL, NULL, 'en', 316, '2015-01-13', NULL, 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786020989976_the-girl-on-the-train.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(61, 'The Shining', NULL, 'Jack Torrance\'s new job at the Overlook Hotel is the perfect chance for a fresh start. As winter closes in and blizzards cut them off, the hotel seems to develop a life of its own.', NULL, NULL, 'en', 447, '1977-01-28', NULL, 'https://m.media-amazon.com/images/I/91U7HNa2NQL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(62, 'In Cold Blood', NULL, 'On November 15, 1959, in the small town of Holcomb, Kansas, four members of the Clutter family were savagely murdered.', NULL, NULL, 'en', 343, '1966-01-01', NULL, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/In_Cold_Blood_%281966%29_front_cover%2C_first_edition.jpg/500px-In_Cold_Blood_%281966%29_front_cover%2C_first_edition.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(63, 'Rebecca', NULL, 'Last night I dreamt I went to Manderley again... The novel begins in Monte Carlo, where our heroine is swept off her feet by the dashing widower Maxim de Winter.', NULL, NULL, 'en', 449, '1938-08-01', NULL, 'https://m.media-amazon.com/images/I/718IOUURHEL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(64, 'The Maltese Falcon', NULL, 'Sam Spade is hired by the fragrant Miss Wonderley to track down her sister, who has eloped with a louse.', NULL, NULL, 'en', 217, '1930-02-14', NULL, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/The_Maltese_Falcon_%281st_ed_cover%29.jpg/500px-The_Maltese_Falcon_%281st_ed_cover%29.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(65, 'The Postman Always Rings Twice', NULL, 'An amoral young tramp. A beautiful, sullen woman with an inconvenient husband. A problem that has only one grisly solution.', NULL, NULL, 'en', 116, '1934-02-17', NULL, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/The_Postman_Always_Rings_Twice_cover.jpg/500px-The_Postman_Always_Rings_Twice_cover.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(66, 'The Talented Mr. Ripley', NULL, 'Tom Ripley is struggling to stay one step ahead of his creditors when a stranger offers him a free trip to Europe.', NULL, NULL, 'en', 272, '1955-01-01', NULL, 'https://m.media-amazon.com/images/I/61a6iv9HgYL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:48:42', '2025-10-19 23:23:14'),
(67, 'The Kite Runner', NULL, 'The unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father\'s servant.', NULL, NULL, 'en', 371, '2003-05-29', NULL, 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/The_Kite_Runner.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(68, 'The Book Thief', NULL, 'It is 1939. Nazi Germany. The country is holding its breath. Death has never been busier, and will be busier still.', NULL, NULL, 'en', 552, '2005-03-14', NULL, 'https://m.media-amazon.com/images/I/914cHl9v7oL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(69, 'Life of Pi', NULL, 'After the tragic sinking of a cargo ship, a solitary lifeboat remains bobbing on the wild, blue Pacific.', NULL, NULL, 'en', 319, '2001-09-11', NULL, 'https://ebooks.gramedia.com/ebook-covers/38882/big_covers/ID_GPU2017MTH07KPOP_B.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(70, 'The Alchemist', NULL, 'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of treasure.', NULL, NULL, 'en', 197, '1988-01-01', NULL, 'https://m.media-amazon.com/images/I/71+2-t7M35L._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(71, 'The Road', NULL, 'A father and his son walk alone through burned America. Nothing moves in the ravaged landscape.', NULL, NULL, 'en', 287, '2006-09-26', NULL, 'https://m.media-amazon.com/images/I/51M7XGLQTBL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(72, 'The Lovely Bones', NULL, 'My name was Salmon, like the fish; first name, Susie. I was fourteen when I was murdered on December 6, 1973.', NULL, NULL, 'en', 328, '2002-07-03', NULL, 'https://m.media-amazon.com/images/I/81ZE6HFYZoL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(73, 'The Help', NULL, 'Twenty-two-year-old Skeeter has just returned home after graduating from Ole Miss. But it\'s 1962, Mississippi, and her mother won\'t be happy till Skeeter\'s married.', NULL, NULL, 'en', 451, '2009-02-10', NULL, 'https://m.media-amazon.com/images/I/81dXmPXfL1L._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(74, 'Water for Elephants', NULL, 'As a young man, Jacob Jankowski was tossed by fate onto a rickety train that was home to the Benzini Brothers Most Spectacular Show on Earth.', NULL, NULL, 'en', 335, '2006-05-26', NULL, 'https://m.media-amazon.com/images/I/919dvY0mE3L._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(75, 'The Fault in Our Stars', NULL, 'Despite the tumor-shrinking medical miracle that has bought her a few years, Hazel has never been anything but terminal.', NULL, NULL, 'en', 313, '2012-01-10', NULL, 'https://m.media-amazon.com/images/I/81-B7ls3jwL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(76, 'Eleanor Oliphant Is Completely Fine', NULL, 'Eleanor Oliphant has learned how to survive – but not how to live. She leads a simple life.', NULL, NULL, 'en', 327, '2017-05-09', NULL, 'https://m.media-amazon.com/images/I/81mveBdSLvL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(77, 'The Nightingale', NULL, 'In the quiet village of Carriveau, Vianne Mauriac says goodbye to her husband, Antoine, as he heads for the Front.', NULL, NULL, 'en', 440, '2015-02-03', NULL, 'https://m.media-amazon.com/images/I/8151hnV9SrL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(78, 'All the Light We Cannot See', NULL, 'Marie-Laure lives with her father in Paris near the Museum of Natural History where he works as the master of its thousands of locks.', NULL, NULL, 'en', 531, '2014-05-06', NULL, 'https://m.media-amazon.com/images/I/81WY6M9XikL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(79, 'A Thousand Splendid Suns', NULL, 'A moving chronicle of Afghan history and a deeply moving story of family, friendship, and the salvation to be found in love.', NULL, NULL, 'en', 372, '2007-05-22', NULL, 'https://m.media-amazon.com/images/I/A1alIcqdZfL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(80, 'The Secret Life of Bees', NULL, 'Set in South Carolina in 1964, this is the tale of Lily Owens, a motherless girl whose life has been shaped by her abusive father.', NULL, NULL, 'en', 301, '2002-01-01', NULL, 'https://m.media-amazon.com/images/I/81kXIB9G0dL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(81, 'The Time Traveler\'s Wife', NULL, 'Clare and Henry met when Clare was just six and Henry thirty-six, and they were married when Clare turned twenty-two.', NULL, NULL, 'en', 518, '2003-01-01', NULL, 'https://m.media-amazon.com/images/I/817iFfLhJ+L._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(82, 'Educated', NULL, 'Tara Westover was seventeen the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches.', NULL, NULL, 'en', 334, '2018-02-20', NULL, 'https://m.media-amazon.com/images/I/71-4MkLN5jL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(83, 'Becoming', NULL, 'In her memoir, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her.', NULL, NULL, 'en', 426, '2018-11-13', NULL, 'https://m.media-amazon.com/images/I/81cJTmFpG-L._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(84, 'Sapiens', NULL, 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution.', NULL, NULL, 'en', 443, '2011-01-01', NULL, 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/591701404_sapiens.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(85, 'The Diary of a Young Girl', NULL, 'Discovered in the attic in which she spent the last years of her life, Anne Frank\'s remarkable diary has become a world classic.', NULL, NULL, 'en', 283, '1947-06-25', NULL, 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/Young_Girl.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(86, 'Into the Wild', NULL, 'In April 1992 a young man from a well-to-do family hitchhiked to Alaska and walked alone into the wilderness north of Mt. McKinley.', NULL, NULL, 'en', 207, '1996-01-01', NULL, 'https://m.media-amazon.com/images/I/61A+LdmTESL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(87, 'Thinking, Fast and Slow', NULL, 'Daniel Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.', NULL, NULL, 'en', 499, '2011-10-25', NULL, 'https://m.media-amazon.com/images/I/61fdrEuPJwL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(88, 'Steve Jobs', NULL, 'Based on more than forty interviews with Steve Jobs conducted over two years, this is the definitive portrait of the greatest innovator of his generation.', NULL, NULL, 'en', 630, '2011-10-24', NULL, 'https://m.media-amazon.com/images/I/71mmowWE5iL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(89, 'The Immortal Life of Henrietta Lacks', NULL, 'Her name was Henrietta Lacks, but scientists know her as HeLa. She was a poor black tobacco farmer whose cells were taken without her knowledge.', NULL, NULL, 'en', 381, '2010-02-02', NULL, 'https://m.media-amazon.com/images/I/81MVJ9RAYFL._AC_UF894,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(90, 'Quiet', NULL, 'At least one-third of the people we know are introverts. This book will permanently change how we see introverts and how introverts see themselves.', NULL, NULL, 'en', 333, '2012-01-24', NULL, 'https://m.media-amazon.com/images/I/710KQAE6d5L._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(91, 'When Breath Becomes Air', NULL, 'At the age of thirty-six, on the verge of completing a decade\'s worth of training as a neurosurgeon, Paul Kalanithi was diagnosed with stage IV lung cancer.', NULL, NULL, 'en', 228, '2016-01-12', NULL, 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/WHEN_BREATH_BECOMES_AIR_US_SC_MM.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(93, 'Twilight', NULL, 'When seventeen-year-old Bella leaves Phoenix to live with her father in Forks, Washington, she meets an exquisitely handsome boy at school.', NULL, NULL, 'en', 498, '2005-10-05', NULL, 'https://upload.wikimedia.org/wikipedia/en/1/1d/Twilightbook.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(94, 'Divergent', NULL, 'In Beatrice Prior\'s dystopian Chicago world, society is divided into five factions, each dedicated to the cultivation of a particular virtue.', NULL, NULL, 'en', 487, '2011-04-25', NULL, 'https://upload.wikimedia.org/wikipedia/en/f/f4/Divergent_%28book%29_by_Veronica_Roth_US_Hardcover_2011.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(95, 'The Maze Runner', NULL, 'If you ain\'t scared, you ain\'t human. When Thomas wakes up in the lift, the only thing he can remember is his name.', NULL, NULL, 'en', 375, '2009-10-06', NULL, 'https://upload.wikimedia.org/wikipedia/en/d/db/The_Maze_Runner_cover.png', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(96, 'The Perks of Being a Wallflower', NULL, 'Charlie is a freshman. And while he\'s not the biggest geek in the school, he is by no means popular.', NULL, NULL, 'en', 213, '1999-02-01', NULL, 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288703i/4327066.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(97, 'Looking for Alaska', NULL, 'Before. Miles \"Pudge\" Halter\'s whole existence has been one big nonevent. After. Nothing is ever the same.', NULL, NULL, 'en', 221, '2005-03-03', NULL, 'https://m.media-amazon.com/images/I/91nTClkODkL._AC_UF1000,1000_QL80_FMwebp_.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(98, 'Thirteen Reasons Why', NULL, 'Clay Jensen returns home from school to find a strange package with his name on it lying on his porch.', NULL, NULL, 'en', 288, '2007-10-18', NULL, 'https://thumbs.readings.com.au/wgu3LEZgqFrKARpNqFDfKNF9vJw=/0x500/https://readings-v4-production.s3.amazonaws.com/assets/541/3fd/0b6/5413fd0b65660d68abdacd0770c8412a731849d2/978014132829420210513-4-1e81cm0.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(99, 'The Giver', NULL, 'Jonas\'s world is perfect. Everything is under control. There is no war or fear or pain. There are no choices.', NULL, NULL, 'en', 208, '1993-04-16', NULL, 'https://upload.wikimedia.org/wikipedia/en/7/7b/The_Giver_first_edition_1993.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(100, 'The Outsiders', NULL, 'No one ever said life was easy. But Ponyboy is pretty sure that he\'s got things figured out.', NULL, NULL, 'en', 192, '1967-04-24', NULL, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/The_Outsiders_%281967%29_1st_edition_front_cover.jpg/500px-The_Outsiders_%281967%29_1st_edition_front_cover.jpg', '2025-10-19 08:49:47', '2025-10-19 23:23:14'),
(101, 'A Wrinkle in Time', NULL, 'It was a dark and stormy night. Out of this wild night, a strange visitor comes to the Murry house.', NULL, NULL, 'en', 247, '1962-01-01', NULL, 'https://mpd-biblio-covers.imgix.net/9780312367558.jpg?w=300dpr=1%201x,%20https://mpd-biblio-covers.imgix.net/9780312367558.jpg?w=300dpr=2%202x,%20https://mpd-biblio-covers.imgix.net/9780312367558.jpg?w=300dpr=3%203x', '2025-10-19 08:49:47', '2025-10-19 23:23:14');

-- --------------------------------------------------------

--
-- Stand-in structure for view `books_uniq`
-- (See below for the actual view)
--
CREATE TABLE `books_uniq` (
`id` bigint(20) unsigned
,`title` varchar(500)
,`release_date` date
);

-- --------------------------------------------------------

--
-- Table structure for table `book_authors`
--

CREATE TABLE `book_authors` (
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `author_id` bigint(20) UNSIGNED NOT NULL,
  `author_order` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_authors`
--

INSERT INTO `book_authors` (`book_id`, `author_id`, `author_order`) VALUES
(1, 2, 1),
(1, 26, 1),
(2, 3, 1),
(2, 24, 1),
(3, 1, 1),
(4, 4, 1),
(5, 5, 1),
(7, 1, 1),
(8, 1, 1),
(9, 1, 1),
(10, 1, 1),
(11, 1, 1),
(12, 1, 1),
(13, 7, 1),
(13, 28, 1),
(14, 8, 1),
(14, 29, 1),
(15, 9, 1),
(16, 10, 1),
(17, 11, 1),
(18, 11, 1),
(19, 11, 1),
(20, 11, 1),
(25, 13, 1),
(26, 14, 1),
(27, 84, 1),
(28, 16, 1),
(29, 16, 1),
(30, 17, 1),
(31, 18, 1),
(32, 19, 1),
(33, 20, 1),
(34, 21, 1),
(35, 22, 1),
(38, 25, 1),
(40, 27, 1),
(43, 86, 1),
(44, 31, 1),
(45, 2, 1),
(45, 26, 1),
(46, 32, 1),
(47, 33, 1),
(48, 34, 1),
(49, 35, 1),
(50, 36, 1),
(51, 37, 1),
(52, 38, 1),
(53, 39, 1),
(54, 40, 1),
(55, 41, 1),
(56, 42, 1),
(57, 43, 1),
(58, 42, 1),
(59, 44, 1),
(60, 45, 1),
(61, 46, 1),
(62, 47, 1),
(63, 48, 1),
(64, 49, 1),
(65, 50, 1),
(66, 51, 1),
(67, 52, 1),
(68, 53, 1),
(69, 54, 1),
(70, 55, 1),
(71, 56, 1),
(72, 57, 1),
(73, 58, 1),
(74, 59, 1),
(75, 60, 1),
(76, 61, 1),
(77, 62, 1),
(78, 63, 1),
(79, 52, 1),
(80, 64, 1),
(81, 65, 1),
(82, 66, 1),
(83, 67, 1),
(84, 68, 1),
(85, 69, 1),
(86, 70, 1),
(87, 71, 1),
(88, 72, 1),
(89, 73, 1),
(90, 74, 1),
(91, 75, 1),
(93, 76, 1),
(94, 77, 1),
(95, 78, 1),
(96, 79, 1),
(97, 60, 1),
(98, 80, 1),
(99, 81, 1),
(100, 85, 1),
(101, 83, 1);

-- --------------------------------------------------------

--
-- Stand-in structure for view `book_avg_ratings`
-- (See below for the actual view)
--
CREATE TABLE `book_avg_ratings` (
`book_id` bigint(20) unsigned
,`avg_rating` decimal(9,4)
,`rating_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `book_copies`
--

CREATE TABLE `book_copies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `barcode` varchar(64) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_copies`
--

INSERT INTO `book_copies` (`id`, `book_id`, `branch_id`, `barcode`, `is_available`, `created_at`) VALUES
(1, 1, 1, '1984-MAIN-001', 0, '2025-10-06 19:04:07'),
(2, 1, 2, '1984-WEST-001', 1, '2025-10-06 19:04:07'),
(3, 2, 1, 'PAP-MAIN-001', 1, '2025-10-06 19:04:07'),
(4, 2, 2, 'PAP-WEST-001', 1, '2025-10-06 19:04:07'),
(5, 3, 1, 'HP1-MAIN-001', 1, '2025-10-06 19:04:07'),
(6, 3, 2, 'HP1-WEST-001', 1, '2025-10-06 19:04:07'),
(7, 4, 1, 'HG-MAIN-001', 1, '2025-10-06 19:04:07'),
(8, 4, 2, 'HG-WEST-001', 1, '2025-10-06 19:04:07'),
(9, 5, 1, 'FSG-MAIN-001', 1, '2025-11-18 10:00:00'),
(10, 5, 2, 'FSG-WEST-001', 1, '2025-11-18 10:00:00'),
(11, 7, 1, 'HP2-MAIN-001', 1, '2025-11-18 10:00:00'),
(12, 7, 2, 'HP2-WEST-001', 1, '2025-11-18 10:00:00'),
(13, 8, 1, 'HP3-MAIN-001', 1, '2025-11-18 10:00:00'),
(14, 8, 2, 'HP3-WEST-001', 1, '2025-11-18 10:00:00'),
(15, 9, 1, 'HP4-MAIN-001', 1, '2025-11-18 10:00:00'),
(16, 9, 2, 'HP4-WEST-001', 1, '2025-11-18 10:00:00'),
(17, 10, 1, 'HP5-MAIN-001', 1, '2025-11-18 10:00:00'),
(18, 10, 2, 'HP5-WEST-001', 1, '2025-11-18 10:00:00'),
(19, 11, 1, 'HP6-MAIN-001', 1, '2025-11-18 10:00:00'),
(20, 11, 2, 'HP6-WEST-001', 1, '2025-11-18 10:00:00'),
(21, 12, 1, 'HP7-MAIN-001', 1, '2025-11-18 10:00:00'),
(22, 12, 2, 'HP7-WEST-001', 1, '2025-11-18 10:00:00'),
(23, 13, 1, 'JE-MAIN-001', 1, '2025-11-18 10:00:00'),
(24, 13, 2, 'JE-WEST-001', 1, '2025-11-18 10:00:00'),
(25, 14, 1, 'WH-MAIN-001', 1, '2025-11-18 10:00:00'),
(26, 14, 2, 'WH-WEST-001', 1, '2025-11-18 10:00:00'),
(27, 15, 1, 'AK-MAIN-001', 1, '2025-11-18 10:00:00'),
(28, 15, 2, 'AK-WEST-001', 1, '2025-11-18 10:00:00'),
(29, 16, 1, 'GWTW-MAIN-001', 1, '2025-11-18 10:00:00'),
(30, 16, 2, 'GWTW-WEST-001', 1, '2025-11-18 10:00:00'),
(31, 17, 1, 'HOB-MAIN-001', 1, '2025-11-18 10:00:00'),
(32, 17, 2, 'HOB-WEST-001', 1, '2025-11-18 10:00:00'),
(33, 18, 1, 'LOTR1-MAIN-001', 1, '2025-11-18 10:00:00'),
(34, 18, 2, 'LOTR1-WEST-001', 1, '2025-11-18 10:00:00'),
(35, 19, 1, 'LOTR2-MAIN-001', 1, '2025-11-18 10:00:00'),
(36, 19, 2, 'LOTR2-WEST-001', 1, '2025-11-18 10:00:00'),
(37, 20, 1, 'LOTR3-MAIN-001', 1, '2025-11-18 10:00:00'),
(38, 20, 2, 'LOTR3-WEST-001', 1, '2025-11-18 10:00:00'),
(39, 25, 1, 'DUNE-MAIN-001', 1, '2025-11-18 10:00:00'),
(40, 25, 2, 'DUNE-WEST-001', 1, '2025-11-18 10:00:00'),
(41, 26, 1, 'NOTW-MAIN-001', 1, '2025-11-18 10:00:00'),
(42, 26, 2, 'NOTW-WEST-001', 1, '2025-11-18 10:00:00'),
(43, 27, 1, 'AGT-MAIN-001', 0, '2025-11-18 10:00:00'),
(44, 27, 2, 'AGT-WEST-001', 1, '2025-11-18 10:00:00'),
(45, 28, 1, 'TWOK-MAIN-001', 1, '2025-11-18 10:00:00'),
(46, 28, 2, 'TWOK-WEST-001', 1, '2025-11-18 10:00:00'),
(47, 29, 1, 'MIST-MAIN-001', 1, '2025-11-18 10:00:00'),
(48, 29, 2, 'MIST-WEST-001', 1, '2025-11-18 10:00:00'),
(49, 30, 1, 'TBI-MAIN-001', 1, '2025-11-18 10:00:00'),
(50, 30, 2, 'TBI-WEST-001', 1, '2025-11-18 10:00:00'),
(51, 31, 1, 'EG-MAIN-001', 1, '2025-11-18 10:00:00'),
(52, 31, 2, 'EG-WEST-001', 1, '2025-11-18 10:00:00'),
(53, 32, 1, 'FOUND-MAIN-001', 1, '2025-11-18 10:00:00'),
(54, 32, 2, 'FOUND-WEST-001', 1, '2025-11-18 10:00:00'),
(55, 33, 1, 'NEUR-MAIN-001', 1, '2025-11-18 10:00:00'),
(56, 33, 2, 'NEUR-WEST-001', 1, '2025-11-18 10:00:00'),
(57, 34, 1, 'MART-MAIN-001', 1, '2025-11-18 10:00:00'),
(58, 34, 2, 'MART-WEST-001', 1, '2025-11-18 10:00:00'),
(59, 35, 1, 'RPO-MAIN-001', 1, '2025-11-18 10:00:00'),
(60, 35, 2, 'RPO-WEST-001', 1, '2025-11-18 10:00:00'),
(61, 38, 1, 'TKAM-MAIN-001', 1, '2025-11-18 10:00:00'),
(62, 38, 2, 'TKAM-WEST-001', 1, '2025-11-18 10:00:00'),
(63, 40, 1, 'GG-MAIN-001', 1, '2025-11-18 10:00:00'),
(64, 40, 2, 'GG-WEST-001', 1, '2025-11-18 10:00:00'),
(65, 43, 1, 'CITR-MAIN-001', 1, '2025-11-18 10:00:00'),
(66, 43, 2, 'CITR-WEST-001', 1, '2025-11-18 10:00:00'),
(67, 44, 1, 'BNW-MAIN-001', 1, '2025-11-18 10:00:00'),
(68, 44, 2, 'BNW-WEST-001', 1, '2025-11-18 10:00:00'),
(69, 45, 1, 'AF-MAIN-001', 1, '2025-11-18 10:00:00'),
(70, 45, 2, 'AF-WEST-001', 1, '2025-11-18 10:00:00'),
(71, 46, 1, 'HF-MAIN-001', 1, '2025-11-18 10:00:00'),
(72, 46, 2, 'HF-WEST-001', 1, '2025-11-18 10:00:00'),
(73, 47, 1, 'MD-MAIN-001', 1, '2025-11-18 10:00:00'),
(74, 47, 2, 'MD-WEST-001', 1, '2025-11-18 10:00:00'),
(75, 48, 1, 'FRANK-MAIN-001', 1, '2025-11-18 10:00:00'),
(76, 48, 2, 'FRANK-WEST-001', 1, '2025-11-18 10:00:00'),
(77, 49, 1, 'DRAC-MAIN-001', 1, '2025-11-18 10:00:00'),
(78, 49, 2, 'DRAC-WEST-001', 1, '2025-11-18 10:00:00'),
(79, 50, 1, 'DG-MAIN-001', 1, '2025-11-18 10:00:00'),
(80, 50, 2, 'DG-WEST-001', 1, '2025-11-18 10:00:00'),
(81, 51, 1, 'LW-MAIN-001', 1, '2025-11-18 10:00:00'),
(82, 51, 2, 'LW-WEST-001', 1, '2025-11-18 10:00:00'),
(83, 52, 1, 'GWDT-MAIN-001', 1, '2025-11-18 10:00:00'),
(84, 52, 2, 'GWDT-WEST-001', 1, '2025-11-18 10:00:00'),
(85, 53, 1, 'GG2-MAIN-001', 1, '2025-11-18 10:00:00'),
(86, 53, 2, 'GG2-WEST-001', 1, '2025-11-18 10:00:00'),
(87, 54, 1, 'DVC-MAIN-001', 1, '2025-11-18 10:00:00'),
(88, 54, 2, 'DVC-WEST-001', 1, '2025-11-18 10:00:00'),
(89, 55, 1, 'SOTL-MAIN-001', 1, '2025-11-18 10:00:00'),
(90, 55, 2, 'SOTL-WEST-001', 1, '2025-11-18 10:00:00'),
(91, 56, 1, 'ATTWN-MAIN-001', 1, '2025-11-18 10:00:00'),
(92, 56, 2, 'ATTWN-WEST-001', 1, '2025-11-18 10:00:00'),
(93, 57, 1, 'HOB2-MAIN-001', 1, '2025-11-18 10:00:00'),
(94, 57, 2, 'HOB2-WEST-001', 1, '2025-11-18 10:00:00'),
(95, 58, 1, 'MOTE-MAIN-001', 1, '2025-11-18 10:00:00'),
(96, 58, 2, 'MOTE-WEST-001', 1, '2025-11-18 10:00:00'),
(97, 59, 1, 'BLL-MAIN-001', 1, '2025-11-18 10:00:00'),
(98, 59, 2, 'BLL-WEST-001', 1, '2025-11-18 10:00:00'),
(99, 60, 1, 'GOTT-MAIN-001', 1, '2025-11-18 10:00:00'),
(100, 60, 2, 'GOTT-WEST-001', 1, '2025-11-18 10:00:00'),
(101, 61, 1, 'SHIN-MAIN-001', 1, '2025-11-18 10:00:00'),
(102, 61, 2, 'SHIN-WEST-001', 1, '2025-11-18 10:00:00'),
(103, 62, 1, 'ICB-MAIN-001', 1, '2025-11-18 10:00:00'),
(104, 62, 2, 'ICB-WEST-001', 1, '2025-11-18 10:00:00'),
(105, 63, 1, 'REB-MAIN-001', 1, '2025-11-18 10:00:00'),
(106, 63, 2, 'REB-WEST-001', 1, '2025-11-18 10:00:00'),
(107, 64, 1, 'MF-MAIN-001', 1, '2025-11-18 10:00:00'),
(108, 64, 2, 'MF-WEST-001', 1, '2025-11-18 10:00:00'),
(109, 65, 1, 'PART-MAIN-001', 1, '2025-11-18 10:00:00'),
(110, 65, 2, 'PART-WEST-001', 1, '2025-11-18 10:00:00'),
(111, 66, 1, 'TMR-MAIN-001', 1, '2025-11-18 10:00:00'),
(112, 66, 2, 'TMR-WEST-001', 1, '2025-11-18 10:00:00'),
(113, 67, 1, 'KR-MAIN-001', 1, '2025-11-18 10:00:00'),
(114, 67, 2, 'KR-WEST-001', 1, '2025-11-18 10:00:00'),
(115, 68, 1, 'BT-MAIN-001', 1, '2025-11-18 10:00:00'),
(116, 68, 2, 'BT-WEST-001', 1, '2025-11-18 10:00:00'),
(117, 69, 1, 'LOP-MAIN-001', 1, '2025-11-18 10:00:00'),
(118, 69, 2, 'LOP-WEST-001', 1, '2025-11-18 10:00:00'),
(119, 70, 1, 'ALC-MAIN-001', 1, '2025-11-18 10:00:00'),
(120, 70, 2, 'ALC-WEST-001', 1, '2025-11-18 10:00:00'),
(121, 71, 1, 'ROAD-MAIN-001', 1, '2025-11-18 10:00:00'),
(122, 71, 2, 'ROAD-WEST-001', 1, '2025-11-18 10:00:00'),
(123, 72, 1, 'LB-MAIN-001', 1, '2025-11-18 10:00:00'),
(124, 72, 2, 'LB-WEST-001', 1, '2025-11-18 10:00:00'),
(125, 73, 1, 'HELP-MAIN-001', 1, '2025-11-18 10:00:00'),
(126, 73, 2, 'HELP-WEST-001', 1, '2025-11-18 10:00:00'),
(127, 74, 1, 'WFE-MAIN-001', 1, '2025-11-18 10:00:00'),
(128, 74, 2, 'WFE-WEST-001', 1, '2025-11-18 10:00:00'),
(129, 75, 1, 'TFIOS-MAIN-001', 1, '2025-11-18 10:00:00'),
(130, 75, 2, 'TFIOS-WEST-001', 1, '2025-11-18 10:00:00'),
(131, 76, 1, 'EO-MAIN-001', 1, '2025-11-18 10:00:00'),
(132, 76, 2, 'EO-WEST-001', 1, '2025-11-18 10:00:00'),
(133, 77, 1, 'NIGHT-MAIN-001', 1, '2025-11-18 10:00:00'),
(134, 77, 2, 'NIGHT-WEST-001', 1, '2025-11-18 10:00:00'),
(135, 78, 1, 'ATLW-MAIN-001', 1, '2025-11-18 10:00:00'),
(136, 78, 2, 'ATLW-WEST-001', 1, '2025-11-18 10:00:00'),
(137, 79, 1, 'TSS-MAIN-001', 1, '2025-11-18 10:00:00'),
(138, 79, 2, 'TSS-WEST-001', 1, '2025-11-18 10:00:00'),
(139, 80, 1, 'SLOB-MAIN-001', 1, '2025-11-18 10:00:00'),
(140, 80, 2, 'SLOB-WEST-001', 1, '2025-11-18 10:00:00'),
(141, 81, 1, 'TTW-MAIN-001', 1, '2025-11-18 10:00:00'),
(142, 81, 2, 'TTW-WEST-001', 1, '2025-11-18 10:00:00'),
(143, 82, 1, 'EDU-MAIN-001', 1, '2025-11-18 10:00:00'),
(144, 82, 2, 'EDU-WEST-001', 1, '2025-11-18 10:00:00'),
(145, 83, 1, 'BEC-MAIN-001', 1, '2025-11-18 10:00:00'),
(146, 83, 2, 'BEC-WEST-001', 1, '2025-11-18 10:00:00'),
(147, 84, 1, 'SAP-MAIN-001', 1, '2025-11-18 10:00:00'),
(148, 84, 2, 'SAP-WEST-001', 1, '2025-11-18 10:00:00'),
(149, 85, 1, 'ANNE-MAIN-001', 1, '2025-11-18 10:00:00'),
(150, 85, 2, 'ANNE-WEST-001', 1, '2025-11-18 10:00:00'),
(151, 86, 1, 'ITW-MAIN-001', 1, '2025-11-18 10:00:00'),
(152, 86, 2, 'ITW-WEST-001', 1, '2025-11-18 10:00:00'),
(153, 87, 1, 'TFS-MAIN-001', 1, '2025-11-18 10:00:00'),
(154, 87, 2, 'TFS-WEST-001', 1, '2025-11-18 10:00:00'),
(155, 88, 1, 'SJ-MAIN-001', 1, '2025-11-18 10:00:00'),
(156, 88, 2, 'SJ-WEST-001', 1, '2025-11-18 10:00:00'),
(157, 89, 1, 'HL-MAIN-001', 1, '2025-11-18 10:00:00'),
(158, 89, 2, 'HL-WEST-001', 1, '2025-11-18 10:00:00'),
(159, 90, 1, 'QUIET-MAIN-001', 1, '2025-11-18 10:00:00'),
(160, 90, 2, 'QUIET-WEST-001', 1, '2025-11-18 10:00:00'),
(161, 91, 1, 'WBBA-MAIN-001', 1, '2025-11-18 10:00:00'),
(162, 91, 2, 'WBBA-WEST-001', 1, '2025-11-18 10:00:00'),
(163, 93, 1, 'TWI-MAIN-001', 1, '2025-11-18 10:00:00'),
(164, 93, 2, 'TWI-WEST-001', 1, '2025-11-18 10:00:00'),
(165, 94, 1, 'DIV-MAIN-001', 1, '2025-11-18 10:00:00'),
(166, 94, 2, 'DIV-WEST-001', 1, '2025-11-18 10:00:00'),
(167, 95, 1, 'MR-MAIN-001', 1, '2025-11-18 10:00:00'),
(168, 95, 2, 'MR-WEST-001', 1, '2025-11-18 10:00:00'),
(169, 96, 1, 'POBW-MAIN-001', 1, '2025-11-18 10:00:00'),
(170, 96, 2, 'POBW-WEST-001', 1, '2025-11-18 10:00:00'),
(171, 97, 1, 'LFA-MAIN-001', 1, '2025-11-18 10:00:00'),
(172, 97, 2, 'LFA-WEST-001', 1, '2025-11-18 10:00:00'),
(173, 98, 1, 'TRW-MAIN-001', 1, '2025-11-18 10:00:00'),
(174, 98, 2, 'TRW-WEST-001', 1, '2025-11-18 10:00:00'),
(175, 99, 1, 'GIV-MAIN-001', 1, '2025-11-18 10:00:00'),
(176, 99, 2, 'GIV-WEST-001', 1, '2025-11-18 10:00:00'),
(177, 100, 1, 'OUT-MAIN-001', 1, '2025-11-18 10:00:00'),
(178, 100, 2, 'OUT-WEST-001', 1, '2025-11-18 10:00:00'),
(179, 101, 1, 'AWIT-MAIN-001', 1, '2025-11-18 10:00:00'),
(180, 101, 2, 'AWIT-WEST-001', 1, '2025-11-18 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `book_genres`
--

CREATE TABLE `book_genres` (
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `genre_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_genres`
--

INSERT INTO `book_genres` (`book_id`, `genre_id`) VALUES
(1, 2),
(2, 3),
(2, 9),
(3, 1),
(4, 2),
(4, 4),
(5, 3),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 3),
(13, 9),
(14, 3),
(14, 9),
(15, 3),
(16, 3),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(25, 4),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 4),
(32, 4),
(33, 4),
(34, 4),
(35, 4),
(38, 9),
(40, 9),
(43, 9),
(44, 2),
(45, 2),
(46, 9),
(47, 9),
(48, 5),
(49, 5),
(50, 9),
(51, 9),
(52, 6),
(53, 7),
(54, 7),
(55, 7),
(56, 6),
(57, 6),
(58, 6),
(59, 6),
(60, 7),
(61, 5),
(62, 15),
(63, 5),
(64, 8),
(65, 8),
(66, 7),
(67, 10),
(68, 10),
(69, 9),
(71, 2),
(73, 10),
(74, 10),
(75, 14),
(76, 9),
(77, 10),
(78, 10),
(79, 10),
(80, 9),
(81, 3),
(81, 9),
(82, 11),
(83, 11),
(84, 13),
(85, 11),
(86, 13),
(87, 13),
(88, 12),
(89, 13),
(90, 13),
(91, 11),
(93, 14),
(94, 2),
(95, 2),
(96, 14),
(97, 14),
(98, 14),
(99, 2),
(100, 14),
(101, 4);

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `address`, `phone`, `created_at`) VALUES
(1, 'Main Branch', NULL, NULL, '2025-10-06 19:04:07'),
(2, 'West Branch', NULL, NULL, '2025-10-06 19:04:07');

-- --------------------------------------------------------

--
-- Table structure for table `collections`
--

CREATE TABLE `collections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'My Collection',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collection_items`
--

CREATE TABLE `collection_items` (
  `collection_id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `added_at` datetime NOT NULL DEFAULT current_timestamp(),
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`user_id`, `book_id`, `created_at`) VALUES
(2, 1, '2025-10-19 10:23:36'),
(2, 7, '2025-10-19 02:01:07'),
(5, 44, '2025-10-19 10:25:08'),
(6, 44, '2025-10-19 10:25:35');

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`id`, `name`, `parent_id`, `created_at`) VALUES
(1, 'Fantasy', NULL, '2025-10-06 19:04:07'),
(2, 'Dystopian', NULL, '2025-10-06 19:04:07'),
(3, 'Romance', NULL, '2025-10-06 19:04:07'),
(4, 'Science Fiction', NULL, '2025-10-06 19:04:07'),
(5, 'Horror', NULL, '2025-10-19 09:31:08'),
(6, 'Mystery', NULL, '2025-10-19 09:31:08'),
(7, 'Thriller', NULL, '2025-10-19 09:31:08'),
(8, 'Crime', NULL, '2025-10-19 09:31:08'),
(9, 'Literary Fiction', NULL, '2025-10-19 09:31:08'),
(10, 'Historical Fiction', NULL, '2025-10-19 09:31:09'),
(11, 'Memoir', NULL, '2025-10-19 09:31:09'),
(12, 'Biography', NULL, '2025-10-19 09:31:09'),
(13, 'Nonfiction', NULL, '2025-10-19 09:31:09'),
(14, 'Young Adult', NULL, '2025-10-19 09:31:09'),
(15, 'True Crime', NULL, '2025-10-19 09:31:09'),
(16, 'Coming-of-Age', NULL, '2025-10-19 09:31:09');

-- --------------------------------------------------------

--
-- Table structure for table `holds`
--

CREATE TABLE `holds` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'queued',
  `queued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ready_by` datetime DEFAULT NULL,
  `fulfilled_loan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `copy_id` bigint(20) UNSIGNED NOT NULL,
  `borrowed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `due_at` datetime NOT NULL,
  `returned_at` datetime DEFAULT NULL,
  `late_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `status` enum('active','late','returned','lost') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `publishers`
--

CREATE TABLE `publishers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `publishers`
--

INSERT INTO `publishers` (`id`, `name`, `created_at`) VALUES
(1, 'Penguin', '2025-10-06 19:04:07'),
(2, 'HarperCollins', '2025-10-06 19:04:07'),
(3, 'Scholastic', '2025-10-06 19:04:07'),
(4, 'Penguin Random House', '2025-10-19 02:24:40'),
(5, 'Simon & Schuster', '2025-10-19 02:24:40'),
(6, 'Macmillan Publishers', '2025-10-19 02:24:40'),
(7, 'Hachette Book Group', '2025-10-19 02:24:40'),
(8, 'Bloomsbury Publishing', '2025-10-19 02:24:40'),
(9, 'Vintage Books', '2025-10-19 02:24:40'),
(10, 'Del Rey Books', '2025-10-19 02:24:40'),
(11, 'Tor Books', '2025-10-19 02:24:40');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `rating` smallint(6) NOT NULL,
  `review` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `book_id`, `rating`, `review`, `created_at`, `updated_at`) VALUES
(12, 2, 7, 5, 'goated', '2025-10-19 02:01:13', '2025-10-19 02:01:13'),
(14, 5, 17, 5, 'Comfort adventure classic.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(15, 5, 18, 5, 'Epic start to the quest.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(16, 5, 19, 4, 'Helm’s Deep rules.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(17, 5, 20, 5, 'Perfect finale.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(18, 5, 25, 5, 'Spice must flow.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(19, 5, 26, 4, 'Kvothe’s origin hits.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(20, 5, 27, 5, 'Brutal, brilliant politics.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(21, 5, 28, 5, 'Roshar is wild.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(22, 5, 29, 4, 'Heists + magic = yes.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(23, 5, 30, 4, 'Gritty & funny.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(24, 6, 31, 5, 'Mind games on hard mode.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(25, 6, 32, 4, 'Big ideas, lean prose.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(26, 6, 33, 4, 'Cyberpunk blueprint.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(27, 6, 34, 5, 'Science + humor ftw.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(28, 6, 35, 4, 'Nerdy dopamine hit.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(29, 6, 4, 4, 'Fast & fierce dystopia.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(30, 6, 2, 5, 'Wit + romance perfection.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(31, 6, 38, 5, 'Still powerful.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(32, 6, 1, 5, 'Bleak & brilliant.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(33, 6, 40, 4, 'Jazz-age tragedy.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(34, 7, 13, 4, 'Gothic independence.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(35, 7, 14, 3, 'Toxic love, iconic.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(36, 7, 43, 4, 'Holden gonna Holden.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(37, 7, 44, 4, 'Cold, clinical, chilling.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(38, 7, 45, 5, 'Tiny book, huge bite.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(39, 7, 46, 4, 'River journey vibes.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(40, 7, 47, 3, 'Obsessive & oceanic.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(41, 7, 48, 5, 'Birth of SF + horror.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(42, 7, 49, 4, 'Atmosphere for days.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(43, 7, 50, 4, 'Beauty with a price.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(44, 8, 51, 4, 'Cozy and earnest.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(45, 8, 52, 5, 'Compulsively twisty.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(46, 8, 53, 5, 'Unreliable narrators—chef’s kiss.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(47, 8, 54, 3, 'Pacey puzzle-box.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(48, 8, 55, 5, 'Lecter = iconic.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(49, 8, 56, 5, 'Christie at peak.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(50, 8, 57, 4, 'Foggy moor chills.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(51, 8, 58, 5, 'All-time reveal.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(52, 8, 59, 4, 'Messy suburban secrets.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(53, 8, 60, 4, 'Addictive commuter noir.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(54, 9, 61, 5, 'Hotel horror masterclass.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(55, 9, 62, 4, 'Chilling reportage.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(56, 9, 63, 5, 'Last night I dreamt…', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(57, 9, 64, 4, 'Hardboiled gold.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(58, 9, 65, 4, 'Lean and lethal.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(59, 9, 66, 5, 'Charmingly sinister.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(60, 9, 67, 5, 'Devastating & tender.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(61, 9, 68, 5, 'Narrated by Death—wow.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(62, 9, 69, 4, 'Tiger on a lifeboat.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(63, 9, 70, 3, 'Simple fable, big vibes.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(64, 10, 71, 4, 'Bleak beauty.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(65, 10, 72, 3, 'Haunting narrator.', '2025-10-19 10:01:52', '2025-10-19 10:01:52'),
(66, 10, 73, 4, 'Moving ensemble.', '2025-10-19 10:01:53', '2025-10-19 10:01:53'),
(67, 10, 74, 4, 'Circus melancholy.', '2025-10-19 10:01:53', '2025-10-19 10:01:53'),
(68, 10, 76, 4, 'Awkward, honest, warm.', '2025-10-19 10:01:53', '2025-10-19 10:01:53'),
(69, 10, 79, 5, 'Heartbreaking resilience.', '2025-10-19 10:13:23', '2025-10-19 10:13:23'),
(70, 10, 78, 5, 'Luminous prose.', '2025-10-19 10:13:23', '2025-10-19 10:13:23'),
(71, 10, 75, 5, 'Bring tissues.', '2025-10-19 10:13:23', '2025-10-19 10:13:23'),
(72, 10, 77, 5, 'Sisters in wartime.', '2025-10-19 10:13:23', '2025-10-19 10:13:23'),
(73, 10, 81, 4, 'Timey-wimey romance.', '2025-10-19 10:13:23', '2025-10-19 10:13:23'),
(76, 2, 1, 5, 'spooky', '2025-10-19 10:23:42', '2025-10-19 10:23:42'),
(78, 5, 1, 5, 'weirdly great', '2025-10-19 10:24:54', '2025-10-19 10:24:54');

-- --------------------------------------------------------

--
-- Table structure for table `recommendations`
--

CREATE TABLE `recommendations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `from_user_id` bigint(20) UNSIGNED NOT NULL,
  `to_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `search_tokens`
--

CREATE TABLE `search_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `book_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(100) NOT NULL,
  `weight` decimal(6,2) NOT NULL DEFAULT 1.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('member','librarian','admin') NOT NULL DEFAULT 'member',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`, `last_login_at`) VALUES
(2, 'admin', NULL, '$2b$10$qTeOj5PQVflfjBVxDj./iuiHbJ.Jbz8jmqkw682Qm4XuQCAeubYDm', 'admin', 1, '2025-10-18 23:56:45', '2025-10-19 02:01:56', NULL),
(3, 'librarian-x', NULL, '$2b$10$7JbYkPUMfeI92v66TqJ9..0pbySiMHSnRMYHDKWhytIuW.lKro2MC', 'librarian', 1, '2025-10-19 02:04:05', '2025-10-19 09:51:49', NULL),
(4, 'librarian-y', NULL, '$2b$10$8ZxDnBlNSc6XkRtmMGnBv.CU22ZI.TJy2oNHoLGtgyHx4HFFj1FO6', 'librarian', 1, '2025-10-19 02:04:27', '2025-10-19 09:51:52', NULL),
(5, 'member1', NULL, '$2b$10$kNyEPO8tlo1unesUb.dtAebGeKyVtF7OPqQwoNOqseBjp1BaClUku', 'member', 1, '2025-10-19 09:48:59', '2025-10-19 09:51:18', NULL),
(6, 'member2', NULL, '$2b$10$26maYukftwvY.W77QIy.YOBO/oO.n/J2Pqm7R3fCu/QAZjkInb6YS', 'member', 1, '2025-10-19 09:49:14', '2025-10-19 09:49:14', NULL),
(7, 'member3', NULL, '$2b$10$h9byDMO2tzrWOEicihuZfOvauq8LSMZxC1os.ubaPyde3voGzb4Di', 'member', 1, '2025-10-19 09:49:28', '2025-10-19 09:49:28', NULL),
(8, 'member4', NULL, '$2b$10$EiziAu0iL/Pk6tzURry1ResKMVMw5WKtjIw8469YQlznDSf3Cf1YC', 'member', 1, '2025-10-19 09:49:46', '2025-10-19 09:49:46', NULL),
(9, 'member5', NULL, '$2b$10$vX3o5.NUSh/s3tkURvcpWOUSVkbBdKlMgvN56YDjYzwGlR.7HHb.W', 'member', 1, '2025-10-19 09:49:59', '2025-10-19 09:49:59', NULL),
(10, 'member6', NULL, '$2b$10$15meUeeieAZklX3tyE4yze1yN2bbk/WoUMwgrGdw4n.0.HfvlP6Oa', 'member', 1, '2025-10-19 09:50:13', '2025-10-19 09:50:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_identities`
--

CREATE TABLE `user_identities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_uid` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `books_uniq`
--
DROP TABLE IF EXISTS `books_uniq`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `books_uniq`  AS SELECT min(`books`.`id`) AS `id`, `books`.`title` AS `title`, `books`.`release_date` AS `release_date` FROM `books` GROUP BY `books`.`title`, `books`.`release_date` ;

-- --------------------------------------------------------

--
-- Structure for view `book_avg_ratings`
--
DROP TABLE IF EXISTS `book_avg_ratings`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `book_avg_ratings`  AS SELECT `b`.`id` AS `book_id`, coalesce(avg(`r`.`rating`),0) AS `avg_rating`, count(`r`.`id`) AS `rating_count` FROM (`books` `b` left join `ratings` `r` on(`r`.`book_id` = `b`.`id`)) GROUP BY `b`.`id` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_logs_user` (`user_id`);

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `authors` ADD FULLTEXT KEY `idx_authors_name` (`name`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn_13` (`isbn_13`),
  ADD KEY `fk_books_publisher` (`publisher_id`);
ALTER TABLE `books` ADD FULLTEXT KEY `idx_books_fulltext` (`title`,`subtitle`,`description`);

--
-- Indexes for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD PRIMARY KEY (`book_id`,`author_id`),
  ADD KEY `idx_book_authors_author` (`author_id`);

--
-- Indexes for table `book_copies`
--
ALTER TABLE `book_copies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_book_copies_barcode` (`barcode`),
  ADD KEY `idx_book_copies_book_branch` (`book_id`,`branch_id`),
  ADD KEY `fk_book_copies_branch` (`branch_id`);

--
-- Indexes for table `book_genres`
--
ALTER TABLE `book_genres`
  ADD PRIMARY KEY (`book_id`,`genre_id`),
  ADD KEY `idx_book_genres_genre` (`genre_id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_branches_name` (`name`);

--
-- Indexes for table `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_collections_user_default` (`user_id`,`is_default`);

--
-- Indexes for table `collection_items`
--
ALTER TABLE `collection_items`
  ADD PRIMARY KEY (`collection_id`,`book_id`),
  ADD KEY `fk_collection_items_book` (`book_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`user_id`,`book_id`),
  ADD KEY `idx_favorites_book` (`book_id`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_genres_name` (`name`),
  ADD KEY `fk_genres_parent` (`parent_id`);
ALTER TABLE `genres` ADD FULLTEXT KEY `idx_genres_name_ft` (`name`);

--
-- Indexes for table `holds`
--
ALTER TABLE `holds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_holds_book_status` (`book_id`,`status`),
  ADD KEY `idx_holds_user_status` (`user_id`,`status`),
  ADD KEY `fk_holds_branch` (`branch_id`),
  ADD KEY `fk_holds_loan` (`fulfilled_loan_id`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loans_user_status` (`user_id`,`status`),
  ADD KEY `idx_loans_copy_status` (`copy_id`,`status`),
  ADD KEY `idx_loans_user_borrowed` (`user_id`,`borrowed_at`);

--
-- Indexes for table `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_publishers_name` (`name`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_ratings_unique` (`user_id`,`book_id`),
  ADD KEY `idx_ratings_book` (`book_id`);

--
-- Indexes for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recommendations_to` (`to_user_id`),
  ADD KEY `idx_recommendations_from` (`from_user_id`),
  ADD KEY `idx_recommendations_book` (`book_id`);

--
-- Indexes for table `search_tokens`
--
ALTER TABLE `search_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_search_tokens_token` (`token`),
  ADD KEY `idx_search_tokens_book` (`book_id`);
ALTER TABLE `search_tokens` ADD FULLTEXT KEY `idx_search_tokens_token_ft` (`token`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_identities`
--
ALTER TABLE `user_identities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_provider_uid` (`provider`,`provider_uid`),
  ADD KEY `fk_user_identities_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `book_copies`
--
ALTER TABLE `book_copies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `holds`
--
ALTER TABLE `holds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `publishers`
--
ALTER TABLE `publishers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `recommendations`
--
ALTER TABLE `recommendations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `search_tokens`
--
ALTER TABLE `search_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_identities`
--
ALTER TABLE `user_identities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_books_publisher` FOREIGN KEY (`publisher_id`) REFERENCES `publishers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD CONSTRAINT `fk_book_authors_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_book_authors_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `book_copies`
--
ALTER TABLE `book_copies`
  ADD CONSTRAINT `fk_book_copies_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_book_copies_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `book_genres`
--
ALTER TABLE `book_genres`
  ADD CONSTRAINT `fk_book_genres_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_book_genres_genre` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `collections`
--
ALTER TABLE `collections`
  ADD CONSTRAINT `fk_collections_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `collection_items`
--
ALTER TABLE `collection_items`
  ADD CONSTRAINT `fk_collection_items_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_collection_items_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_favorites_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `genres`
--
ALTER TABLE `genres`
  ADD CONSTRAINT `fk_genres_parent` FOREIGN KEY (`parent_id`) REFERENCES `genres` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `holds`
--
ALTER TABLE `holds`
  ADD CONSTRAINT `fk_holds_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_holds_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_holds_loan` FOREIGN KEY (`fulfilled_loan_id`) REFERENCES `loans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_holds_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `fk_loans_copy` FOREIGN KEY (`copy_id`) REFERENCES `book_copies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `fk_ratings_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD CONSTRAINT `fk_recommendations_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_recommendations_from` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_recommendations_to` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `search_tokens`
--
ALTER TABLE `search_tokens`
  ADD CONSTRAINT `fk_search_tokens_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_identities`
--
ALTER TABLE `user_identities`
  ADD CONSTRAINT `fk_user_identities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
