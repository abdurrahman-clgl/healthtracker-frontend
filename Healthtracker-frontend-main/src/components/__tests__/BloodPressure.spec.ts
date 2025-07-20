import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import axios from 'axios';
import BloodPressure from '@/components/BloodPressure.vue';

// Mocking axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('BloodPressure.vue', () => {
    type BloodPressureEntry = { id: number; dateRecorded: string; systolicPressure: number; diastolicPressure: number };
    const beispielAntwort: BloodPressureEntry[] = [
        { id: 1, dateRecorded: new Date().toISOString(), systolicPressure: 120, diastolicPressure: 80 }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('sollte eine Nachricht anzeigen, wenn die Liste vom Backend leer ist', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });
        const wrapper = shallowMount(BloodPressure);
        await flushPromises();
        expect(wrapper.text()).toContain('Noch keine Blutdruckeinträge aufgezeichnet.');
    });

    it('sollte die Liste vom Backend rendern', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: beispielAntwort });
        const wrapper = shallowMount(BloodPressure);
        await flushPromises();
        const erwarteteZeilen = 1 + beispielAntwort.length; // Überschrift + eine Zeile pro Eintrag
        expect(wrapper.findAll('tr').length).toBe(erwarteteZeilen);
        expect(wrapper.text()).toContain('120');
        expect(wrapper.text()).toContain('80');
    });


    it('sollte einen Blutdruckeintrag löschen', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: beispielAntwort });
        mockedAxios.delete.mockResolvedValueOnce({});
        const wrapper = shallowMount(BloodPressure);
        await flushPromises();

        await wrapper.find('tbody tr .btn-delete').trigger('click');
        await flushPromises();

        expect(mockedAxios.delete).toHaveBeenCalledWith(expect.any(String));

        const einträge = wrapper.findAll('tbody tr');
        expect(einträge.length).toBe(0);
    });
});
