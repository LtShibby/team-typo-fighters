import uuid

from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from models.player import Player
from models.game import Game
from models.prompt import Prompt

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from supabase import create_client

app = FastAPI()

SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.post("/create_player")
async def create_player(player: Player):
    response = supabase.table("players").insert({
        "username": player.username
    }).execute()

    print('response: ', response)
    # Check for errors in the response
    if not response.data:
        raise HTTPException(status_code=400, detail=f"Error: {response.error.message}")
    return {"message": "Player created successfully", "data": response}

@app.post("/create_game")
async def create_game(game: Game):
    print('game: ', game)
    response = supabase.table("games").insert({
        "target_text": "abcde"
    }).execute()

    print('response: ', response)
    # Check for errors in the response
    if not response.data:
        raise HTTPException(status_code=400, detail=f"Error: {response.error.message}")
    return {"message": "Game created successfully", "data": response}

@app.get("/get_game_prompts")
async def get_game_prompts():

    response = supabase.table("prompts").select("*").execute()
    print('response: ', response)

    # Check for errors in the response
    if not response.data:
        print('in here')
        raise HTTPException(status_code=400, detail=f"Error: {response.error.message}")
    return {"message": "Player created successfully", "data": response.data}