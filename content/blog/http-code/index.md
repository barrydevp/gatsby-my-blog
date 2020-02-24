---
status: private
title: HTTP Code RESTful
date: "2019-12-05T22:40:32.169Z"
description: Some basic http code for REST API.
---

# Description Of Usual Server Responses:
### 200 OK - the request was successful (some API calls may return 201 instead).
### 201 Created - the request was successful and a resource was created.
### 204 No Content - the request was successful but there is no representation to return (i.e. the response is empty).

### 400 Bad Request - the request could not be understood or was missing required parameters.
### 401 Unauthorized - authentication failed or user doesn't have permissions for requested operation.
### 403 Forbidden - access denied.
### 404 Not Found - resource was not found.
### 405 Method Not Allowed - requested method is not supported for resource.
### 406 Not Acceptable - the target resource does not have a current representation that would be acceptable to the user agent, according to the proactive negotiation header fields received in the request.
### 409 Conflict - request could not be completed due to a conflict with the current state of the target resource.
### 422 Unprocessable Entity - requested data contain invalid values.
### 429 Too Many Requests - exceeded Mailtrap API limits. Pause requests, wait up to one minute, and try again (you can check rate limits in X-RATELIMIT-LIMIT and X-RATELIMIT-REMAINING headers).
