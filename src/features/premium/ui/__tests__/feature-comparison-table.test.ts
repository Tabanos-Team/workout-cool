import { describe, it, expect } from "vitest";

import {
  classifyFeatureValue,
} from "../../lib/feature-comparison-logic";

describe("FeatureComparisonTable - classifyFeatureValue", () => {

  describe("valores booleanos", () => {
    it("debe retornar check-green para true", () => {
      expect(classifyFeatureValue(true)).toBe("check-green");
    });

    it("debe retornar x-gray para false", () => {
      expect(classifyFeatureValue(false)).toBe("x-gray");
    });
  });

  describe("valores especiales", () => {
    it("debe retornar infinity-unlimited para el valor de Unlimited", () => {
      expect(classifyFeatureValue("Unlimited", "Unlimited")).toBe("infinity-unlimited");
    });

    it("debe retornar plain-text si el texto de Unlimited no coincide", () => {
      expect(classifyFeatureValue("Unlimited", "Ilimitado")).toBe("plain-text");
    });
  });

  describe("valores que contienen templates", () => {
    it("debe retornar star-string si contiene la palabra templates", () => {
      expect(classifyFeatureValue("Pro templates")).toBe("star-string");
      expect(classifyFeatureValue("50+ templates")).toBe("star-string");
    });
  });

  describe("valores de acceso temprano y beta", () => {
    it("debe retornar target-early-access si contiene Early o Beta", () => {
      expect(classifyFeatureValue("Early Access")).toBe("target-early-access");
      expect(classifyFeatureValue("Beta Testing")).toBe("target-early-access");
    });
  });

  describe("textos planos", () => {
    it("debe retornar plain-text para strings comunes", () => {
      expect(classifyFeatureValue("Basic")).toBe("plain-text");
      expect(classifyFeatureValue("Complete")).toBe("plain-text");
      expect(classifyFeatureValue("")).toBe("plain-text");
    });
  });
});

describe("FeatureComparisonTable - estructura de categorias", () => {
  const categories = [
    {
      name: "Equipment",
      features: [
        { name: "Exercise library", free: "Basic", premium: "Complete" },
        { name: "Custom exercise", free: false, premium: "Unlimited" },
      ],
    },
    {
      name: "Tracking",
      features: [
        { name: "Workout history", free: "6 months", premium: "Unlimited" },
        { name: "Progress statistics", free: false, premium: true },
      ],
    },
  ];

  it("debe validar la estructura basica de las categorias de la tabla", () => {
    expect(categories.length).toBeGreaterThan(0);
    categories.forEach((cat) => {
      expect(cat.features.length).toBeGreaterThan(0);
      cat.features.forEach((feat) => {
        expect(feat.premium).toBeDefined();
      });
    });
  });
});