#!/usr/bin/env python3

import json
import time

import requests
import api.schemas.message

BASE_URL = 'http://127.0.0.1:8000'


def post_message(name, message):
    url = f"{BASE_URL}/messages"
    m = api.schemas.message.MessageBase(name=name, message=message)
    requests.post(url, json=m.model_dump())


def get_message(message_id):
    url = f"{BASE_URL}/messages/{message_id}"
    res = requests.get(url)
    res_dict = json.loads(res.text)
    response = api.schemas.message.Message.model_validate(res_dict)
    return response


def print_message(message):
    star = "★" if message.important else ""
    print(f"{message.update_time.strftime('%H:%M:%S')} "
          f"{message.id} "
          f"{message.name}: {message.message}{star}")


def check(server_current_id):
    url = BASE_URL
    url = f"{url}/messages/current_id"
    res = requests.get(url)
    res_dict = json.loads(res.text)
    if server_current_id is not None and \
       res_dict['current_id'] != server_current_id:
        for i in range(server_current_id + 1, res_dict['current_id'] + 1):
            message = get_message(i)
            print_message(message)

    return res_dict['current_id']


def main():
    server_current_id = None
    while True:
        server_current_id = check(server_current_id)
        time.sleep(1)


if __name__ == "__main__":
    main()
