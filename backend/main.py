import random
from datetime import datetime, timedelta
from typing import List

import jwt
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWTError
from pydantic import BaseModel
import bcrypt
import sqlite3
import tacacs_plus

from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

app = FastAPI()
origins = [
    "http://localhost:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = sqlite3.connect('authdatabase.db')
cursor = conn.cursor()


# User model
class User(BaseModel):
    username: str
    password: str

# Role model
class Role(BaseModel):
    name: str

# Device model
class Device(BaseModel):
    id: int
    name: str
    ip_address: str
    mac_address: str
    manufacturer: str
    model: str
    device_type: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    status: str

class Link(BaseModel):
    id: int
    source: int
    target: int
    bandwidth: int
    traffic: int
    latency: int
    isDown: bool

@app.post('/register/')
async def register_user(user: User):
    cursor.execute('SELECT * FROM users WHERE username=?', (user.username,))
    existing_user = cursor.fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists.")

    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

    cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (user.username, hashed_password))
    user_id = cursor.lastrowid  # Get the last inserted id

    # Get the default role ID by its name ("user")
    cursor.execute('SELECT id FROM roles WHERE name=?', ("user",))
    default_role_id = cursor.fetchone()[0]

    # Associate the user with the default role in the user_roles table
    cursor.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', (user_id, default_role_id))

    conn.commit()

    return {"message": "Registration successful!", "user_id": user_id}


@app.delete("/delete_user/{user_id}/")
async def delete_user(user_id: int):
    cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
    existing_user = cursor.fetchone()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found.")

    cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()

    return {"message": "User deleted successfully"}


@app.put("/update_user/{user_id}/", response_model=User)
async def update_user(user_id: int, updated_user: User):
    cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
    existing_user = cursor.fetchone()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found.")

    hashed_password = bcrypt.hashpw(updated_user.password.encode('utf-8'), bcrypt.gensalt())
    cursor.execute("UPDATE users SET username=?, password=? WHERE id=?",
                   (updated_user.username, hashed_password, user_id))
    conn.commit()

    return updated_user


# Dependency for checking user role in the endpoint
def get_user_role(user: User = Depends()):
    cursor.execute(
        "SELECT roles.id, roles.name FROM roles JOIN user_roles ON roles.id = user_roles.role_id WHERE user_roles.user_id=?",
        (user.id,))
    role_data = cursor.fetchone()
    if not role_data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden.")
    return Role(id=role_data[0], name=role_data[1])

security = HTTPBearer()

async def get_current_user_role(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, "secret_key", algorithms=["HS256"])
        user_role = payload["role"]
        return Role(name=user_role)
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token or token expired.")

@app.get("/protected_endpoint/")
async def protected_endpoint(user_role: Role = Depends(get_current_user_role)):
    if user_role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden.")

    return {"message": "Welcome, admin!"}

@app.get("/get_user/")
async def get_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, "secret_key", algorithms=["HS256"])
        user_id = payload["user_id"]

        cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
        existing_user = cursor.fetchone()

        return existing_user

    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token or token expired.")


@app.post("/login/")
async def login(user: User):
    cursor.execute('SELECT * FROM users WHERE username=?', (user.username,))
    existing_user = cursor.fetchone()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    stored_password = existing_user[2]
    if bcrypt.checkpw(user.password.encode('utf-8'), stored_password):

        cursor.execute(
            "SELECT roles.name FROM roles JOIN user_roles ON roles.id = user_roles.role_id WHERE user_roles.user_id=?",
            (existing_user[0],),
        )
        role_data = cursor.fetchone()

        expiration = datetime.utcnow() + timedelta(hours=24)
        payload = {"user_id": existing_user[0], "exp": expiration, "role": role_data[0]}
        print(payload)
        token = jwt.encode(payload, "secret_key", algorithm="HS256")

        cursor.execute('INSERT INTO audit_logs (user_id, action, timestamp) VALUES (?, ?,?)',
                       (existing_user[0], "login", datetime.utcnow()))
        conn.commit()

        return {
            "message": "Login successful",
            "token": token,
            "user": {"username": existing_user[1]}
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/add_device/")
async def add_device(device: Device):

    cursor.execute('INSERT INTO devices (name, ip_address, mac_address, manufacturer, model, device_type, created_at, '
                   'updated_at) '
                   'VALUES (?, ?,?,?,?,?,?,?)',
                   (device.name, device.ip_address, device.mac_address, device.manufacturer,device.model, device.device_type, device.created_at, device.updated_at))

    conn.commit()

    return {"message": "Device adding successful!", "device": device}

@app.delete("/delete_device/{device_id}/")
async def delete_device(device_id: int,):

    cursor.execute("SELECT * FROM devices WHERE id=?", (device_id,))
    existing_device = cursor.fetchone()
    if not existing_device:
        raise HTTPException(status_code=404, detail="Device not found.")

    cursor.execute("DELETE FROM devices WHERE id=?", (device_id,))
    conn.commit()

    return {"message": "Device deleted successfully"}

@app.put("/update_device/{device_id}/")
async def update_device(device_id: int, updated_device: Device):

    cursor.execute(
        "UPDATE devices SET name=?, ip_address=?, mac_address=?, manufacturer=?, model=?, device_type=?, created_at=?, updated_at=? "
        "WHERE id=?",
        (
            updated_device.name,
            updated_device.ip_address,
            updated_device.mac_address,
            updated_device.manufacturer,
            updated_device.model,
            updated_device.device_type,
            updated_device.created_at,
            updated_device.updated_at,
            device_id,
        ),
    )
    conn.commit()
    return {"message": "Device updating successful!", "device": updated_device}

@app.get("/activate_device/{device_id}/{status}/")
async def activate_device(device_id: int, status: str):
    if status == "active":
        new_status = "active"
    elif status == "offline":
        new_status = "offline"
    elif status == "down":
        new_status = "down"
    else:
        return {"error": "Invalid status"}

    cursor.execute(
        "UPDATE devices SET status=? "
        "WHERE id=?",
        (
            new_status,
            device_id,
        ),
    )

    cursor.execute("SELECT * FROM devices WHERE id=?", (device_id,))
    existing_device = cursor.fetchone()

    conn.commit()
    return {"message": "Device " + status, "device": existing_device }

@app.put("/activate_link/{link_id}/{status}/")
async def active_link(link_id: int, status: str, updated_info: Link):
    if status == "down":
        is_down = True
    elif status == "active":
        is_down = False
    else:
        return {"error": "Invalid status"}

    cursor.execute(
        "UPDATE links SET isDown=?, bandwidth= ?, latency=?, traffic=?"
        "WHERE link_id=?",
        (
            is_down,
            updated_info.bandwidth,
            updated_info.latency,
            updated_info.traffic,
            link_id,
        ),
    )
    print(updated_info)

    cursor.execute("SELECT * FROM links WHERE link_id=?", (link_id,))
    existing_link = cursor.fetchone()

    conn.commit()
    return {"message": "Link " + status, "link": existing_link }

@app.get("/links/")
async def getLinks():

    cursor.execute('SELECT * FROM links')
    links = cursor.fetchall()
    print(links)
    link_list = []
    for link_data in links:

        link = Link(
            id=link_data[0],
            source=link_data[1],
            target=link_data[2],
            bandwidth=link_data[3],
            traffic=link_data[4],
            latency=link_data[5],
            isDown=link_data[6]
        )
        link_list.append(link)

    return link_list

@app.post("/add_link/")
async def add_link(link: Link):

    cursor.execute('INSERT INTO links (source, target, bandwidth, traffic, latency)'
                   'VALUES (?, ?,?,?,?)',
                   (link.source, link.target, link.bandwidth, link.traffic, link.latency))

    conn.commit()

    return {"message": "Link adding successful!", "link": link}

@app.get("/devices/")
async def test():
    cursor.execute('SELECT * FROM devices')
    devices = cursor.fetchall()
    device_list = []
    for device_data in devices:
        device = Device(
            id=device_data[0],
            name=device_data[1],
            ip_address=device_data[2],
            mac_address=device_data[3],
            manufacturer=device_data[4],
            model=device_data[5],
            device_type=device_data[6],
            status=device_data[9]
        )
        device_list.append(device)

    return device_list


@app.get("/devices/{device_id}/")
async def test2(device_id: int):
    cursor.execute('SELECT * FROM devices WHERE id=?', (device_id,))
    device_data = cursor.fetchone()

    if not device_data:
        raise HTTPException(status_code=404, detail="Device not found.")

    device = Device(
        id=device_data[0],
        name=device_data[1],
        ip_address=device_data[2],
        mac_address=device_data[3],
        manufacturer=device_data[4],
        model=device_data[5],
        device_type=device_data[6],
        status = device_data[9]
    )

    return device



@app.get("/all_device_info/")
async def get_all_device_info():
    cursor.execute('SELECT * FROM Manufacturers')
    manufacturers = cursor.fetchall()
    manufacturer_list = []
    for manufacturer_data in manufacturers:
        manufacturer = {
            "id": manufacturer_data[0],
            "name": manufacturer_data[1]
        }
        manufacturer_list.append(manufacturer)

    cursor.execute('SELECT * FROM Models')
    models = cursor.fetchall()
    model_list = []
    for model_data in models:
        model = {
            "id": model_data[0],
            "manufacturer_id": model_data[2],
            "device_type_id": model_data[3],
            "model_name": model_data[1]
        }
        model_list.append(model)

    cursor.execute('SELECT * FROM ManufacturerDeviceTypes')
    manufacturer_device_types = cursor.fetchall()
    manufacturer_device_type_list = []
    for mdt_data in manufacturer_device_types:
        manufacturer_device_type = {
            "manufacturer_id": mdt_data[1],
            "device_type_id": mdt_data[2]
        }
        manufacturer_device_type_list.append(manufacturer_device_type)

    cursor.execute('SELECT * FROM DeviceTypes')
    device_types = cursor.fetchall()
    device_type_list = []
    for device_type_data in device_types:
        device_type = {
            "id": device_type_data[0],
            "name": device_type_data[1]
        }
        device_type_list.append(device_type)

    response = {
        "manufacturers": manufacturer_list,
        "models": model_list,
        "manufacturer_device_types": manufacturer_device_type_list,
        "device_types": device_type_list
    }

    return response


@app.on_event("shutdown")
def shutdown_db():
    conn.close()

import requests


device_list = []

@app.get("/device-locations")
async def get_device_locations():
    global device_list
    cursor.execute('SELECT * FROM devices')
    devices = cursor.fetchall()
    device_list = []
    for device_data in devices:
        device = Device(
            id=device_data[0],
            name=device_data[1],
            ip_address=device_data[2],
            mac_address=device_data[3],
            manufacturer=device_data[4],
            model=device_data[5],
            device_type=device_data[6],
            status=device_data[9]
        )
        device_list.append(device)
    api_key = "3d27f7ce1b98e2"
    geolocation_data = get_locations(api_key)
    print("Geolocation Data:", geolocation_data)
    response = {
        "geo_info": geolocation_data,
    }
    return JSONResponse(content=response)

def get_public_ip():
    try:
        response = requests.get("https://api.ipify.org?format=json")
        if response.status_code == 200:
            data = response.json()
            public_ip = data.get("ip")
            return public_ip
        else:
            print(f"Failed to get public IP. Status code: {response.status_code}")
    except requests.RequestException as e:
        print(f"Error occurred while fetching public IP: {e}")

    return None

def get_locations(api_key):
    geolocation_data = []
    global device_list
    for device in device_list:
        ip = device.ip_address
        url = f"https://ipinfo.io/{ip}?token={api_key}"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            lat, lon = data.get("loc", "").split(",")
            geolocation_data.append((float(lat), float(lon)))

    return geolocation_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
