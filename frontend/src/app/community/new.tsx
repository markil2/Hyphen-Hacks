import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, ChipRow, DemoNotice, goBack, Screen, T, TextField } from '@/components/ui';
import { stores, useCatalog, useCollection, useDoc } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';

export default function NewPost() {
  const params = useLocalSearchParams<{ group?: string }>();
  const groups = useCatalog(stores.groups);
  const posts = useCollection(stores.posts);
  const profile = useDoc(stores.profile).value;
  const [group, setGroup] = useState<string | null>(params.group ?? null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missing = !group || !title.trim() || !body.trim();

  const submit = async () => {
    setTouched(true);
    if (missing) return;
    setError(null);
    try {
      await posts.create(
        { groupId: group!, author: profile?.parent.name ?? 'You', createdAt: new Date().toISOString(), title: title.trim(), body: body.trim(), replies: 0, mine: true },
        'post',
      );
      goBack('/community');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen sheet
      back
      title="Write a post"
      subtitle="Share where you are. Others will meet you there."
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Post (demo)" onPress={submit} loading={posts.isBusy('post')} size="lg" full />
        </View>
      }>
      <ChipRow label="Group" value={group} onChange={setGroup} options={groups.items.map((g) => ({ value: g.id, label: g.name }))} />
      {touched && !group ? <T variant="small" style={{ color: colors.danger }}>Choose a group.</T> : null}
      <TextField label="Title" placeholder="A short summary" value={title} onChangeText={setTitle} error={touched && !title.trim() ? 'Add a title.' : undefined} />
      <TextField label="Post" placeholder="What’s on your mind?" value={body} onChangeText={setBody} multiline error={touched && !body.trim() ? 'Write a few words.' : undefined} />
      <T variant="caption">Please keep it kind. Avoid sharing medical advice as fact — point others to their clinician.</T>
      <DemoNotice>Demo: your post is saved on this device only. No one else will see it.</DemoNotice>
    </Screen>
  );
}
