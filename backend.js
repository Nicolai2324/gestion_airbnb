const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialisation de Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://votre-projet.firebaseio.com" // Remplace par ton vrai URL Firebase
  });
  console.log("✅ Firebase connecté avec succès !");
} catch (error) {
  console.error("🔥 Erreur d'initialisation Firebase :", error);
}

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// Route pour tester si le serveur fonctionne
app.get("/", (req, res) => {
  console.log("✅ Requête reçue sur /");
  res.send("Le serveur fonctionne !");
});

// Route pour récupérer les réservations avec un LOG D'ERREUR détaillé
app.get("/reservations", async (req, res) => {
  console.log("✅ Requête reçue sur /reservations");
  try {
    const snapshot = await db.collection("reservations").get();
    if (snapshot.empty) {
      console.log("ℹ️ Aucune réservation trouvée.");
      return res.json([]); // Retourne une liste vide si rien n'existe
    }
    const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reservations);
  } catch (error) {
    console.error("🔥 Erreur Firebase :", error);
    res.status(500).send("Erreur lors de la récupération des réservations.");
  }
});

// Route pour ajouter une réservation (test)
app.post("/reservations", async (req, res) => {
  console.log("✅ Requête POST reçue sur /reservations avec les données :", req.body);
  try {
    const newReservation = req.body;
    const docRef = await db.collection("reservations").add(newReservation);
    res.json({ id: docRef.id, ...newReservation });
  } catch (error) {
    console.error("🔥 Erreur Firebase lors de l'ajout :", error);
    res.status(500).send("Erreur lors de l'ajout de la réservation.");
  }
});

// Route pour récupérer les tâches
app.get("/tasks", async (req, res) => {
  console.log("✅ Requête reçue sur /tasks");
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    console.error("🔥 Erreur Firebase :", error);
    res.status(500).send("Erreur lors de la récupération des tâches.");
  }
});

// Démarrage du serveur sur le port 5001
app.listen(5001, "0.0.0.0", () => {
  console.log("✅ Serveur backend Node.js en écoute sur http://localhost:5001");
});

