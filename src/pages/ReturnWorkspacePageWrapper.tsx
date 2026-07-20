import React from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ReturnWorkspacePage } from './ReturnWorkspacePage';
import { ScaleReturnDetailPage } from './ScaleReturnDetailPage';
import { DocumentExplorerPage } from './DocumentExplorerPage';

export const ReturnWorkspacePageWrapper: React.FC = () => {
  const { returnId } = useParams();
  const [searchParams] = useSearchParams();
  const isScale = returnId?.startsWith('scale-ret-') || searchParams.get('dataset') === 'scale';

  // Detect /documents sub-route by checking current pathname
  const isDocExplorer = typeof window !== 'undefined' && window.location.pathname.endsWith('/documents');

  if (isDocExplorer) {
    return <DocumentExplorerPage />;
  }

  if (isScale) {
    return <ScaleReturnDetailPage />;
  }
  return <ReturnWorkspacePage />;
};
export default ReturnWorkspacePageWrapper;
