#!/bin/bash
set -e
echo "============================================"
echo "  MEDITHREX — PostgreSQL Setup & Start"
echo "============================================"
echo ""
echo "Installing dependencies..."
(cd backend  && npm install)
(cd frontend && npm install)
echo ""
echo "Initialising database schema..."
(cd backend && npm run db:init)
echo ""
echo "Seeding demo data..."
(cd backend && npm run db:seed)
echo ""
echo "Starting backend on :5000 ..."
(cd backend && npm run dev) &
sleep 2
echo "Starting frontend on :5173 ..."
(cd frontend && npm run dev) &
echo ""
echo "============================================"
echo " Backend  → http://localhost:5000/api/health"
echo " Frontend → http://localhost:5173"
echo ""
echo " Admin: admin@medithrex.co.ke / Admin@2024"
echo " User:  jane@hospital.co.ke   / User@2024"
echo "============================================"
wait
