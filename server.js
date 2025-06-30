const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/auth');
const tarefaRoutes = require('./routes/tarefas');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tarefas', tarefaRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
