"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireFlightPlanEditor, requirePermission } from "@/lib/authorize";
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

async function requireActiveFlightPlan(id: string) {
  const flightPlan = await prisma.flightPlan.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!flightPlan) {
    throw new Error("Flight plan not found.");
  }

  return flightPlan;
}

export async function createFlightPlan(formData: FormData) {
  await requireFlightPlanEditor();

  const code = readString(formData, "code");
  const title = readString(formData, "title");
  const operationDate = readOperationDate(formData);
  const notes = readString(formData, "notes");
  const { geometryJson, geometryType } = readGeometryPayload(formData);
  const costCenterId = readRequiredRelation(formData, "costCenterId");
  const clientId = readRequiredRelation(formData, "clientId");
  const droneId = readRequiredRelation(formData, "droneId");
  const operatorId = readRequiredRelation(formData, "operatorId");

  if (!code || !title) {
    throw new Error("Code and title are required.");
  }

  const record = await prisma.flightPlan.create({
    data: {
      code,
      title,
      operationDate,
      permissionStatus: "DRAFT",
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
  redirect(`/flight-plans/${record.id}?tab=2`);
}

export async function updateFlightPlan(id: string, formData: FormData) {
  await requireFlightPlanEditor();
  await requireActiveFlightPlan(id);

  const code = readString(formData, "code");
  const title = readString(formData, "title");
  const operationDate = readOperationDate(formData);
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
  redirect(`/flight-plans/${id}`);
}

export async function updateFlightPlanGeometry(id: string, formData: FormData) {
  await requireFlightPlanEditor();
  await requireActiveFlightPlan(id);

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

export async function deleteFlightPlan(id: string) {
  await requirePermission("flight_plan:delete");
  await requireActiveFlightPlan(id);

  await prisma.flightPlan.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/flight-plans");
  revalidatePath("/dashboard");
  revalidatePath(`/flight-plans/${id}`);
  revalidatePath(`/flight-plans/${id}/geometry`);
  redirect("/flight-plans");
}
