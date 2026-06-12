import { describe, it, expect } from "vitest";

import {
  generateSlug,
  generateSlugsForAllLanguages,
  ensureUniqueSlug,
} from "./slug";

describe("slug utilities", () => {
    it("genera slug a partir del nombre de una rutina", () => {
        expect(
            generateSlug("Rutina de Fuerza para Principiantes")
        ).toBe("rutina-de-fuerza-para-principiantes");
    });

    it("elimina caracteres especiales del título de un entrenamiento", () => {
        expect(
            generateSlug("Entrenamiento Full Body: Nivel Intermedio!")
        ).toBe("entrenamiento-full-body-nivel-intermedio");
    });

    it("elimina espacios adicionales", () => {
        expect(
            generateSlug("   Plan   de   Hipertrofia   ")
        ).toBe("plan-de-hipertrofia");
    });

    it("genera slug para contenido en español", () => {
        expect(
            generateSlug("Guía de Nutrición Deportiva")
        ).toBe("guia-de-nutricion-deportiva");
    });

    it("genera slug para contenido en portugués", () => {
        expect(
            generateSlug("Treinamento para Ganho de Massa Muscular")
        ).toBe("treinamento-para-ganho-de-massa-muscular");
    });

    it("genera slug para contenido en ruso", () => {
        expect(
            generateSlug("Тренировка для набора мышечной массы")
        ).toBeTruthy();
    });

    it("convierte títulos en chino a pinyin", () => {
        expect(
            generateSlug("力量训练基础")
        ).toContain("-");
    });

    it("genera slugs para todos los idiomas", () => {
        const result = generateSlugsForAllLanguages({
            title: "Rutina Full Body para Principiantes",
            titleEn: "Full Body Workout for Beginners",
            titleEs: "Rutina Full Body para Principiantes",
            titlePt: "Treino Full Body para Iniciantes",
            titleRu: "Тренировка всего тела для начинающих",
            titleZhCn: "初学者全身训练",
        });

        expect(result.slug).toBe(
            "rutina-full-body-para-principiantes"
        );
        expect(result.slugEn).toBe(
            "full-body-workout-for-beginners"
        );
        expect(result.slugEs).toContain("rutina");
        expect(result.slugPt).toBeTruthy();
        expect(result.slugRu).toBeTruthy();
        expect(result.slugZhCn).toBeTruthy();
    });

    it("retorna el mismo slug cuando es único", () => {
        expect(
            ensureUniqueSlug("rutina-full-body", [
            "plan-de-cardio",
            "entrenamiento-de-piernas",
            ])
        ).toBe("rutina-full-body");
    });

    it("agrega un número cuando el slug ya existe", () => {
        expect(
            ensureUniqueSlug("rutina-full-body", [
            "rutina-full-body",
            ])
        ).toBe("rutina-full-body-1");
    });

    it("incrementa el número hasta encontrar un slug disponible", () => {
        expect(
            ensureUniqueSlug("rutina-full-body", [
            "rutina-full-body",
            "rutina-full-body-1",
            "rutina-full-body-2",
            ])
        ).toBe("rutina-full-body-3");
    });
});