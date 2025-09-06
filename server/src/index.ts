import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameStateManager } from './game/GameState';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const gameState = new GameStateManager();

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    const player = gameState.addPlayer(socket.id);
    socket.emit('initialState', gameState.getState());
    io.emit('playerJoined', { id: socket.id, player });

    socket.on('movePlayer', (data: {x: number, y: number}) => {
        console.log('Player moved:', socket.id, 'to', data);
        const player = gameState.getPlayer(socket.id);
        if (player && player.alive) {
            gameState.updatePlayerPosition(socket.id, data.x, data.y);
            io.emit('gameState', gameState.getState());
        } else {
            console.log('Player cannot move (dead):', socket.id);
        }
    });

    socket.on('throwSnowball', (data: {toX: number, toY: number}) => {
        console.log('Snowball thrown:', socket.id, 'to', data);
        const player = gameState.getPlayer(socket.id);
        if (player && player.alive && player.snowballs > 0) {
            player.snowballs--;
            console.log('Player can throw snowball:', { alive: player.alive, snowballs: player.snowballs });
            
            io.emit('snowballThrown', {
                fromX: player.x,
                fromY: player.y,
                toX: data.toX,
                toY: data.toY,
                playerId: socket.id
            });

            io.emit('gameState', gameState.getState());

            setTimeout(() => {
                const hitPlayerId = gameState.handleSnowballHit(socket.id, data.toX, data.toY);
                if (hitPlayerId) {
                    io.to(hitPlayerId).emit('playerHit', { hitBy: socket.id, target: hitPlayerId });
                }
                io.emit('gameState', gameState.getState());
            }, 500);
        } else {
            console.log('Player cannot throw snowball:', { alive: player?.alive, snowballs: player?.snowballs });
        }
    });

    socket.on('pickupSnowball', () => {
        console.log('Pickup snowball request from:', socket.id);
        const player = gameState.getPlayer(socket.id);
        if (player && player.alive && player.snowballs < 5) {
            player.snowballs++;
            console.log('Player picked up snowball:', socket.id, 'Total:', player.snowballs);
            io.emit('gameState', gameState.getState());
        } else {
            console.log('Player cannot pickup snowball:', { alive: player?.alive, snowballs: player?.snowballs });
        }
    });

    socket.on('revivePlayer', () => {
        console.log('Player revived:', socket.id);
        gameState.revivePlayer(socket.id);
        io.emit('gameState', gameState.getState());
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        gameState.removePlayer(socket.id);
        io.emit('playerLeft', socket.id);
        io.emit('gameState', gameState.getState());
    });
});

httpServer.listen(3000, () => {
    console.log('Server running on port 3000');
});