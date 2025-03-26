import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockContractState = {
  lastDeviceId: 0,
  devices: new Map(),
  txSender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Mock principal
}

// Mock functions to simulate Clarity contract functions
function registerDevice(name, serialNumber, model, manufacturer, acquisitionDate) {
  const newId = mockContractState.lastDeviceId + 1
  mockContractState.lastDeviceId = newId
  
  mockContractState.devices.set(newId, {
    name,
    "serial-number": serialNumber,
    model,
    manufacturer,
    "acquisition-date": acquisitionDate,
    "last-maintenance-date": 0,
    owner: mockContractState.txSender,
  })
  
  return { value: newId }
}

function getDevice(deviceId) {
  return mockContractState.devices.get(deviceId)
}

function updateDeviceOwner(deviceId, newOwner) {
  const device = mockContractState.devices.get(deviceId)
  if (!device) return { error: 1 }
  
  if (device.owner !== mockContractState.txSender) {
    return { error: 2 }
  }
  
  device.owner = newOwner
  mockContractState.devices.set(deviceId, device)
  return { value: true }
}

function updateMaintenanceDate(deviceId, maintenanceDate) {
  const device = mockContractState.devices.get(deviceId)
  if (!device) return { error: 1 }
  
  if (device.owner !== mockContractState.txSender) {
    return { error: 2 }
  }
  
  device["last-maintenance-date"] = maintenanceDate
  mockContractState.devices.set(deviceId, device)
  return { value: true }
}

describe("Device Registration Contract", () => {
  beforeEach(() => {
    // Reset the mock state before each test
    mockContractState.lastDeviceId = 0
    mockContractState.devices = new Map()
  })
  
  it("should register a new device", () => {
    const result = registerDevice("Portable Ultrasound", "SN12345", "SonoEasy 3000", "MedTech Inc", 1625097600)
    
    expect(result.value).toBe(1)
    expect(mockContractState.lastDeviceId).toBe(1)
    
    const device = getDevice(1)
    expect(device).toBeDefined()
    expect(device.name).toBe("Portable Ultrasound")
    expect(device["serial-number"]).toBe("SN12345")
    expect(device.model).toBe("SonoEasy 3000")
    expect(device.manufacturer).toBe("MedTech Inc")
    expect(device["acquisition-date"]).toBe(1625097600)
    expect(device["last-maintenance-date"]).toBe(0)
    expect(device.owner).toBe(mockContractState.txSender)
  })
  
  it("should update device owner", () => {
    // First register a device
    registerDevice("Portable Ultrasound", "SN12345", "SonoEasy 3000", "MedTech Inc", 1625097600)
    
    // Then update the owner
    const newOwner = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = updateDeviceOwner(1, newOwner)
    
    expect(result.value).toBe(true)
    
    const device = getDevice(1)
    expect(device.owner).toBe(newOwner)
  })
  
  it("should update maintenance date", () => {
    // First register a device
    registerDevice("Portable Ultrasound", "SN12345", "SonoEasy 3000", "MedTech Inc", 1625097600)
    
    // Then update the maintenance date
    const maintenanceDate = 1635097600
    const result = updateMaintenanceDate(1, maintenanceDate)
    
    expect(result.value).toBe(true)
    
    const device = getDevice(1)
    expect(device["last-maintenance-date"]).toBe(maintenanceDate)
  })
  
  it("should fail to update device if not owner", () => {
    // First register a device
    registerDevice("Portable Ultrasound", "SN12345", "SonoEasy 3000", "MedTech Inc", 1625097600)
    
    // Change the tx-sender to simulate a different user
    const originalSender = mockContractState.txSender
    mockContractState.txSender = "ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    
    // Try to update the owner
    const newOwner = "ST4PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = updateDeviceOwner(1, newOwner)
    
    expect(result.error).toBe(2)
    
    // Restore the original sender
    mockContractState.txSender = originalSender
  })
})

