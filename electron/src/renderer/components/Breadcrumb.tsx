import '../styles/Breadcrumb.css';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ currentPath, onNavigate }: Props) {
  const parts = currentPath.split('/').filter(Boolean);

  const handleClick = (index: number) => {
    const path = parts.slice(0, index + 1).join('/');
    onNavigate(path);
  };

  return (
    <div className="breadcrumb">
      <button className="breadcrumb-item" onClick={() => onNavigate('documents')}>
        📱 Home
      </button>
      {parts.map((part, index) => (
        <div key={index} className="breadcrumb-group">
          <span className="separator">›</span>
          <button
            className="breadcrumb-item"
            onClick={() => handleClick(index)}
          >
            {part}
          </button>
        </div>
      ))}
    </div>
  );
}
