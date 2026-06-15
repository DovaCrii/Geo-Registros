"use server";

import { FlightPlanStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const allowedGeometryTypes = new Set([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
  "Feature",
  "FeatureCollection",
]);

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readStatus(formData: FormData) {
  const value = readString(formData, "status");

  if (value === FlightPlanStatus.READY_FOR_GEOMETRY) {
    return FlightPlanStatus.READY_FOR_GEOMETRY;
  }

  if (value === FlightPlanStatus.ON_HOLD) {
    return FlightPlanStatus.ON_HOLD;
  }

  return FlightPlanStatus.DRAFT;
}

function readRequiredRelation(formData: FormData, key: string) {
  const value = readString(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function readOperationDate(formData: FormData) {
  const value = readString(formData, "operationDate");

  if (!value) {
    throw new Error("operationDate is required.");
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("operationDate is invalid.");
  }

  return parsed;
}

function readGeometryPayload(formData: FormData) {
  const value = readString(formData, "geometryPayload");

  if (!value) {
    return {
      geometryJson: Prisma.DbNull,
      geometryType: null,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("geometryPayload must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("geometryPayload must be a GeoJSON object.");
  }

  const type = "type" in parsed && typeof parsed.type === "string" ? parsed.type : "";

  if (!allowedGeometryTypes.has(type)) {
    throw new Error("geometryPayload type is not supported yet.");
  }

  return {
    geometryJson: parsed as Prisma.InputJsonValue,
    geometryType: type,
  };
}

export async function createFlightPlan(formData: FormData) {
  const code = readString(formData, "code");
  const title = readString(formData, "title");
  const operationDate = readOperationDate(formData);
  const status = readStatus(formData);
  const notes = readString(formData, "notes");
  const { geometryJson, geometryType } = readGeometryPayload(formData);
  const costCenterId = readRequiredRelation(formData, "costCenterId");
  const clientId = readRequiredRelation(formData, "clientId");
  const droneId = readRequiredRelation(formData, "droneId");
  const operatorId = readRequiredRelation(formData, "operatorId");

  if (!code || !title) {
    throw new Error("Code and title are required.");
  }

  await prisma.flightPlan.create({
    data: {
      code,
      title,
      operationDate,
      status,
      notes: notes || null,
      geometryJson,
      geometryType,
      costCenterId,
      clientId,
      droneId,
      operatorId,
    },
  });

  revalidatePath("/flight-plans");
  redirect("/flight-plans");
}

export async function updateFlightPlan(id: string, formData: FormData) {
  const code = readString(formData, "code");
  const title = readString(formData, "title");
  const operationDate = readOperationDate(formData);
  const status = readStatus(formData);
  const notes = readString(formData, "notes");
  const { geometryJson, geometryType } = readGeometryPayload(formData);
  const costCenterId = readRequiredRelation(formData, "costCenterId");
  const clientId = readRequiredRelation(formData, "clientId");
  const droneId = readRequiredRelation(formData, "droneId");
  const operatorId = readRequiredRelation(formData, "operatorId");

  if (!code || !title) {
    throw new Error("Code and title are required.");
  }

  await prisma.flightPlan.update({
    where: { id },
    data: {
      code,
      title,
      operationDate,
      status,
      notes: notes || null,
      geometryJson,
      geometryType,
      costCenterId,
      clientId,
      droneId,
      operatorId,
    },
  });

  revalidatePath("/flight-plans");
  revalidatePath(`/flight-plans/${id}`);
  redirect("/flight-plans");
}

export async function updateFlightPlanGeometry(id: string, formData: FormData) {
  const { geometryJson, geometryType } = readGeometryPayload(formData);

  await prisma.flightPlan.update({
    where: { id },
    data: {
      geometryJson,
      geometryType,
    },
  });

  revalidatePath("/flight-plans");
  revalidatePath(`/flight-plans/${id}`);
  revalidatePath(`/flight-plans/${id}/geometry`);
  redirect(`/flight-plans/${id}/geometry`);
}
