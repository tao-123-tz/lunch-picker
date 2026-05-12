import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast, { showToast } from '../components/Toast';
import type { DishTags } from '../types';
import { TAG_GROUPS } from '../utils/constants';
import { addDish, updateDish, getDishById } from '../lib/db';
import { compressImage } from '../utils/image';

export default function AddDishPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState<DishTags>({
    taste: 'not_spicy',
    type: 'rice',
    cuisine: 'chinese',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDishById(Number(id)).then((dish) => {
      if (dish) {
        setImageUrl(dish.imageDataUrl);
        setName(dish.name);
        setTags(dish.tags);
      }
    });
  }, [id]);

  const handleCamera = () => cameraRef.current?.click();
  const handleAlbum = () => albumRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setImageUrl(dataUrl);
    } catch {
      showToast('图片处理失败');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast('请输入菜名'); return; }
    if (!imageUrl) { showToast('请上传菜品图片'); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await updateDish(Number(id), { name: name.trim(), imageDataUrl: imageUrl, tags });
      } else {
        await addDish({ name: name.trim(), imageDataUrl: imageUrl, tags });
      }
      showToast(isEdit ? '已更新' : '已添加');
      setTimeout(() => navigate(-1), 800);
    } catch (e: any) {
      const msg = e?.message || e?.error_description || JSON.stringify(e);
      showToast('保存失败: ' + (msg.length > 40 ? msg.slice(0, 40) + '...' : msg));
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = !!name.trim() && !!imageUrl;

  return (
    <div className="page">
      <div className="nav-bar" style={{ margin: '-16px -16px 16px', borderRadius: '0 0 16px 16px' }}>
        <button className="nav-back" onClick={() => navigate(-1)}>‹</button>
        <span className="nav-title">{isEdit ? '编辑菜品' : '添加菜品'}</span>
      </div>

      {/* 图片预览 */}
      <div
        onClick={handleAlbum}
        style={{
          width: '100%', aspectRatio: '1', borderRadius: 16,
          overflow: 'hidden', backgroundColor: '#EBE4D5',
          marginBottom: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#8B7355' }}>
            <div style={{ fontSize: 48 }}>📷</div>
            <div>点击添加菜品图片</div>
          </div>
        )}
      </div>

      {/* 两个上传入口 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={handleCamera} style={btnStyle}>
          📸 拍照
        </button>
        <button onClick={handleAlbum} style={btnStyle}>
          🖼️ 从相册选择
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment"
          style={{ display: 'none' }} onChange={handleFileChange} />
        <input ref={albumRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* 菜名 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 12 }}>菜名</label>
        <input
          type="text" placeholder="请输入菜名（最多20字）" maxLength={20}
          value={name} onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%', height: 48, padding: '0 16px', borderRadius: 12,
            border: '1px solid #E8D5B7', fontSize: 15, outline: 'none',
            backgroundColor: '#FFF',
          }}
        />
      </div>

      {/* 标签 */}
      {TAG_GROUPS.map((group) => (
        <div key={group.name} style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 12 }}>{group.name}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.options.map((opt) => {
              const active = tags[group.field] === opt.key;
              return (
                <span key={opt.key}
                  className={`tag ${active ? 'tag--active' : ''}`}
                  onClick={() => setTags({ ...tags, [group.field]: opt.key })}
                  style={{ padding: '10px 18px', fontSize: 15, cursor: 'pointer' }}
                >{opt.icon} {opt.label}</span>
              );
            })}
          </div>
        </div>
      ))}

      {/* 保存 */}
      <div style={{ paddingBottom: 32 }}>
        <button className="btn-primary"
          disabled={!canSubmit || saving} onClick={handleSave}
          style={{ width: '100%', height: 48, fontSize: 17 }}
        >
          {saving ? '保存中...' : isEdit ? '保存修改' : '添加菜品'}
        </button>
      </div>

      <Toast />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  flex: 1, height: 44, borderRadius: 12,
  border: '1px solid #E8D5B7', backgroundColor: '#FFF',
  fontSize: 15, display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 6, cursor: 'pointer',
};
