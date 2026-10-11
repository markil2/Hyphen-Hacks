import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Screen, Segmented } from '@/components/ui';
import { BabyHealthTab } from '@/features/fridge/BabyHealthTab';
import { NotesTab } from '@/features/fridge/NotesTab';
import { RecipesTab } from '@/features/fridge/RecipesTab';

type Tab = 'baby' | 'recipes' | 'notes';

/** The kitchen fridge: the baby's health log, recipe ideas, and the family's notes. */
export default function Fridge() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'baby');

  return (
    <Screen back title="Fridge" subtitle="Baby’s health log, recipe ideas and family notes.">
      <Segmented
        label="Fridge sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'baby', label: 'Baby' },
          { value: 'recipes', label: 'Recipes' },
          { value: 'notes', label: 'Notes' },
        ]}
      />
      {tab === 'baby' ? <BabyHealthTab /> : null}
      {tab === 'recipes' ? <RecipesTab /> : null}
      {tab === 'notes' ? <NotesTab /> : null}
    </Screen>
  );
}
