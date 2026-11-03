$ErrorActionPreference = 'Stop'
$baseUrl = 'http://localhost:4000'
$serverProcess = $null
Add-Type -AssemblyName System.Net.Http

function Assert-Equal($actual, $expected, $label) {
  if ($actual -ne $expected) { throw "$label - expected $expected, got $actual" }
  Write-Host "PASS: $label ($actual)" -ForegroundColor Green
}

$httpClient = [System.Net.Http.HttpClient]::new()

function Send-Request($method, $path, $jsonBody = $null) {
  $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::$method, "$baseUrl$path")
  if ($null -ne $jsonBody) {
    $request.Content = [System.Net.Http.StringContent]::new($jsonBody, [System.Text.Encoding]::UTF8, 'application/json')
  }
  $response = $httpClient.SendAsync($request).GetAwaiter().GetResult()
  $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
  [pscustomobject]@{
    StatusCode = [int]$response.StatusCode
    Body = $body
  }
}

try {
  $portOpen = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
  if (-not $portOpen) {
    $serverProcess = Start-Process -FilePath 'node' -ArgumentList 'expressApp.js' -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Hidden
    Start-Sleep -Milliseconds 700
  }

  $tasksResponse = Send-Request 'Get' '/tasks'
  Assert-Equal $tasksResponse.StatusCode 200 'GET /tasks status'
  $tasks = $tasksResponse.Body | ConvertFrom-Json
  if ($tasks.Count -lt 3) { throw "GET /tasks initial count - expected at least 3, got $($tasks.Count)" }
  Write-Host "PASS: GET /tasks initial count ($($tasks.Count))" -ForegroundColor Green
  $initialCount = $tasks.Count

  $taskResponse = Send-Request 'Get' '/tasks/1'
  Assert-Equal $taskResponse.StatusCode 200 'GET /tasks/1 status'
  $task = $taskResponse.Body | ConvertFrom-Json
  Assert-Equal $task.id 1 'GET /tasks/1 id'

  $invalidTask = @{ taskName = 'Missing priority'; assignedTo = 'Test User'; status = 'Pending' } | ConvertTo-Json
  $invalid = Send-Request 'Post' '/tasks' $invalidTask
  Assert-Equal $invalid.StatusCode 400 'POST /tasks missing priority status'
  $invalidBody = $invalid.Body | ConvertFrom-Json
  if ($invalidBody.error -notmatch 'priority') { throw "POST validation error did not mention priority: $($invalidBody.error)" }
  Write-Host "PASS: POST /tasks missing priority explains validation error" -ForegroundColor Green

  $newTask = @{
    taskName = 'EchoAPI body test'
    assignedTo = 'Amit Kumar'
    status = 'Pending'
    priority = 'Medium'
  } | ConvertTo-Json
  $created = Send-Request 'Post' '/tasks' $newTask
  Assert-Equal $created.StatusCode 201 'POST /tasks status'
  $createdBody = $created.Body | ConvertFrom-Json
  $createdId = [int]$createdBody.task.id
  Assert-Equal $createdBody.task.taskName 'EchoAPI body test' 'POST /tasks body'
  $afterPost = (Send-Request 'Get' '/tasks').Body | ConvertFrom-Json
  Assert-Equal $afterPost.Count ($initialCount + 1) 'POST /tasks adds a task'

  $updatedTask = @{
    taskName = 'Updated task from test script'
    assignedTo = 'Rahul Sharma'
    status = 'Completed'
    priority = 'High'
  } | ConvertTo-Json
  $updated = Send-Request 'Put' '/tasks/1' $updatedTask
  Assert-Equal $updated.StatusCode 200 'PUT /tasks/1 status'
  $updatedBody = $updated.Body | ConvertFrom-Json
  Assert-Equal $updatedBody.task.status 'Completed' 'PUT /tasks/1 body'

  $deleted = Send-Request 'Delete' "/tasks/$createdId"
  Assert-Equal $deleted.StatusCode 200 'DELETE /tasks/{createdId} status'
  $deletedBody = $deleted.Body | ConvertFrom-Json
  Assert-Equal $deletedBody.task.id $createdId 'DELETE /tasks/{createdId} body'
  $afterDelete = (Send-Request 'Get' '/tasks').Body | ConvertFrom-Json
  Assert-Equal $afterDelete.Count $initialCount 'DELETE removes the created task'

  $missing = Send-Request 'Get' '/tasks/99999'
  Assert-Equal $missing.StatusCode 404 'GET /tasks/99999 status'
  $missingBody = $missing.Body | ConvertFrom-Json
  Assert-Equal $missingBody.error 'Task not found' 'GET /tasks/99999 body'

  Write-Host 'All Express API tests passed.' -ForegroundColor Cyan
} finally {
  if ($serverProcess) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  }
  $httpClient.Dispose()
}
