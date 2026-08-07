// test/fixtures.js — minimal valid documents satisfying each model's
// required fields, so tests only need to override what's relevant to them.
import Subscription from "../models/Subscription.model.js";
import Realtor from "../models/realtor.model.js";
import Estate from "../models/estate.model.js";
import { Buy2SellLead } from "../models/Buy2sell.model.js";

let counter = 0;
function uniqueSuffix() {
  counter += 1;
  return `${Date.now()}-${counter}`;
}

export async function makeRealtor(overrides = {}) {
  const suffix = uniqueSuffix();
  return Realtor.create({
    firstName: "Realtor",
    lastName: suffix,
    email: `realtor-${suffix}@example.com`,
    phone: "+2348000000000",
    birthDate: new Date("1990-01-01"),
    passwordHash: "not-a-real-hash",
    referralCode: `REF-${suffix}`,
    ...overrides,
  });
}

export async function makeEstate(overrides = {}) {
  const suffix = uniqueSuffix();
  return Estate.create({
    estate: `Test Estate ${suffix}`,
    address: "1 Test Avenue, Lekki",
    location: "Lagos",
    purpose: "Residential",
    title: "CofO",
    price: "5,000,000",
    sqm: "500sqm",
    desc: "A test estate.",
    // No upload happens in tests — these only need to satisfy `required`.
    img: `https://res.cloudinary.com/test/image/upload/${suffix}.jpg`,
    imgPublicId: `estates/featured/${suffix}`,
    ...overrides,
  });
}

export async function makeSubscription(overrides = {}) {
  const suffix = uniqueSuffix();
  return Subscription.create({
    referenceNumber: `KHL-TEST-${suffix}`,
    estateName: "Oxford Heights Awoyaya",
    title: "Mr",
    firstName: "Test",
    lastName: "Client",
    maritalStatus: "Single",
    dateOfBirth: new Date("1995-01-01"),
    gender: "Male",
    residentialAddress: "1 Test Street",
    cityTown: "Lekki",
    lga: "Eti-Osa",
    state: "Lagos",
    phone: "+2348011111111",
    email: `client-${suffix}@example.com`,
    plotType: "Residential",
    paymentPlan: "Outright",
    numberOfPlots: 1,
    plotSize: "500sqm",
    surveyType: "C of O",
    totalAmount: 10_000_000,
    kinFirstName: "Kin",
    kinLastName: "Person",
    kinAddress: "2 Test Street",
    kinPhone: "+2348022222222",
    ...overrides,
  });
}

export async function makeBuy2SellLead(overrides = {}) {
  const suffix = uniqueSuffix();
  return Buy2SellLead.create({
    referenceNumber: `KHL-B2S-TEST-${suffix}`,
    fullName: "Test Investor",
    email: `investor-${suffix}@example.com`,
    phone: "+2348033333333",
    duration: "12 Months",
    principalAmount: 5_000_000,
    roiPercent: 48,
    ...overrides,
  });
}
