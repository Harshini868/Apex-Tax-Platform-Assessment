import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppProvider, useApp } from '../context/AppContext';
import { AppRoutes } from './routes';

describe('ApexTax AI Application Journey 1 Tracing & Verifications', () => {
  it('deep-linking to the wages field selects it by default', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText('John Miller Personal Tax File')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wages, salaries, tips' })).toBeInTheDocument();
  });

  it('selecting another field updates the URL query parameter and changes active panel data', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const partnershipItem = screen.getByRole('button', {
      name: /schedule e, line 28/i,
    });
    await user.click(partnershipItem);

    expect(screen.getByRole('heading', { name: 'Partnership income' })).toBeInTheDocument();
  });

  it('wages evidence trace displays source document details and calculation steps', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText('W2_John_Miller_2025.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 Wages, tips, other comp.')).toBeInTheDocument();
    expect(screen.getByText('W-2 Box 1')).toBeInTheDocument();
  });

  it('preparer can verify a complete source match', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const verifyBtn = screen.getByRole('button', { name: /verify source match/i });
    await user.click(verifyBtn);

    const badges = screen.getAllByText('Verified');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('preparer can correct an eligible AI value with a valid reason', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const correctBtn = screen.getByRole('button', { name: /correct value/i });
    await user.click(correctBtn);

    const valInput = screen.getByLabelText(/new tax value/i);
    const reasonInput = screen.getByLabelText(/reason for override/i);

    await user.clear(valInput);
    await user.type(valInput, '151900.00');
    await user.type(reasonInput, 'Adjusted for tax audit calculation match');

    const saveBtn = screen.getByRole('button', { name: /save overwrite/i });
    await user.click(saveBtn);

    expect(screen.getAllByText('$151,900.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Awaiting Review')[0]).toBeInTheDocument();
  });

  it('correction requires a valid value and valid explanation reason', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const correctBtn = screen.getByRole('button', { name: /correct value/i });
    await user.click(correctBtn);

    const valInput = screen.getByLabelText(/new tax value/i);
    const reasonInput = screen.getByLabelText(/reason for override/i);
    const saveBtn = screen.getByRole('button', { name: /save overwrite/i });

    await user.clear(valInput);
    await user.type(valInput, 'abc');
    await user.type(reasonInput, 'Short');
    await user.click(saveBtn);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('original AI value remains visible side-by-side after correction override', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const correctBtn = screen.getByRole('button', { name: /correct value/i });
    await user.click(correctBtn);

    const valInput = screen.getByLabelText(/new tax value/i);
    const reasonInput = screen.getByLabelText(/reason for override/i);
    await user.clear(valInput);
    await user.type(valInput, '151900.00');
    await user.type(reasonInput, 'Audit verification adjustments');
    await user.click(screen.getByRole('button', { name: /save overwrite/i }));

    expect(screen.getAllByText('$151,900.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$152,500.00').length).toBeGreaterThan(0);
  });

  it('client role context is read-only and restricts actions', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const select = screen.getByLabelText(/demo mode — preview as:/i);
    await user.selectOptions(select, 'client');

    const messagesLink = screen.getByRole('link', { name: /messages/i });
    await user.click(messagesLink);

    expect(screen.queryByRole('button', { name: /correct value/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /verify source match/i })).not.toBeInTheDocument();
    expect(screen.getByText('Client Transparency View')).toBeInTheDocument();
  });

  it('reviewer can lock a field preventing preparer edits', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const select = screen.getByLabelText(/demo mode — preview as:/i);
    await user.selectOptions(select, 'reviewer');

    const returnsLink = screen.getByRole('link', { name: /returns/i });
    await user.click(returnsLink);

    const lockBtn = screen.getByRole('button', { name: /verify and lock/i });
    await user.click(lockBtn);

    const lockReasonInput = screen.getByLabelText(/specify locking reason/i);
    await user.type(lockReasonInput, 'Locked post audit checking');
    await user.click(screen.getByRole('button', { name: /confirm lock/i }));

    expect(screen.getAllByText('Locked')[0]).toBeInTheDocument();

    const disclosureBtn = screen.getByRole('button', { name: /why is this locked\?/i });
    expect(disclosureBtn).toBeInTheDocument();
  });

  it('missing evidence prevents verification and displays a warning reason', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line8']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText('Missing Source Evidence')).toBeInTheDocument();
    expect(screen.getByText('K1_John_Miller_Partnership.pdf')).toBeInTheDocument();
    
    const verifyBtn = screen.getByRole('button', { name: /verify source match/i });
    expect(verifyBtn).toBeDisabled();
  });

  it('conflicting evidence displays both source documents with their own visual highlighted preview and values', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line2a']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    // Data-driven multi-source notice (not a hardcoded "Conflicting Source Evidence" branch)
    expect(screen.getByText(/2 independent source documents were matched/i)).toBeInTheDocument();

    expect(screen.getAllByText('1099INT_John_Chase.pdf').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1099INT_John_Wells.pdf').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$1,200.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$1,800.00').length).toBeGreaterThan(0);

    // Both sources render their own visual document preview (not text-only)
    expect(screen.getAllByText('Simulated Document Viewer').length).toBe(2);

    // The AI Reasoning tab is now reachable for conflicting fields too (previously hidden by the
    // old hardcoded early-return branch)
    const aiTab = screen.getByRole('tab', { name: /ai reasoning & confidence/i });
    expect(aiTab).toBeInTheDocument();
  });

  it('field search checklist displays a no-result state', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText(/search lines/i);
    await user.type(searchInput, 'unknown-non-existent-line');

    expect(screen.getByText('No forms or lines match your search.')).toBeInTheDocument();
  });

  it('unknown field parameter shows error and reset button', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=invalid-field-param']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText('Unknown Tax Field Reference')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset to wages field/i })).toBeInTheDocument();
  });

  it('conflicting evidence disables the verify action instead of allowing a doomed click', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line2a']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );

    const verifyBtn = screen.getByRole('button', { name: /verify source match/i });
    expect(verifyBtn).toBeDisabled();
  });

  it('reviewer cannot lock a field with missing or conflicting evidence', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const select = screen.getByLabelText(/demo mode — preview as:/i);
    await user.selectOptions(select, 'reviewer');
    await user.click(screen.getByRole('link', { name: /returns/i }));
    await user.click(screen.getByRole('button', { name: /taxable interest/i }));

    expect(screen.queryByRole('button', { name: /verify and lock/i })).not.toBeInTheDocument();
  });

  it('AI Reasoning tab shows confidence explanation, uncertainty, and suggested next action', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f8949-proceeds']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const aiTab = screen.getByRole('tab', { name: /ai reasoning & confidence/i });
    await user.click(aiTab);

    expect(screen.getByText(/low ocr certainty score/i)).toBeInTheDocument();
    expect(screen.getByText(/digits "84,750" might be read as/i)).toBeInTheDocument();
    expect(screen.getByText(/manually inspect form 1099-b/i)).toBeInTheDocument();
  });

  it('verifying a field records a visible audit history entry', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const verifyBtn = screen.getByRole('button', { name: /verify source match/i });
    await user.click(verifyBtn);

    expect(screen.getByText(/verified source match: \$152,500\.00/i)).toBeInTheDocument();
  });

  it('preparer cannot edit a field once a reviewer has locked it', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    const select = screen.getByLabelText(/demo mode — preview as:/i);
    await user.selectOptions(select, 'reviewer');
    await user.click(screen.getByRole('link', { name: /returns/i }));

    await user.click(screen.getByRole('button', { name: /verify and lock/i }));
    await user.type(screen.getByLabelText(/specify locking reason/i), 'Locked for test');
    await user.click(screen.getByRole('button', { name: /confirm lock/i }));

    await user.selectOptions(select, 'preparer');
    await user.click(screen.getByRole('link', { name: /returns/i }));

    expect(screen.queryByRole('button', { name: /correct value/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /verify source match/i })).not.toBeInTheDocument();
  });

  it('correction validation errors are programmatically associated with the invalid fields', async () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/return/ret-john-miller-1040?field=f1040-line1z']}>
          <AppRoutes />
        </MemoryRouter>
      </AppProvider>
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /correct value/i }));

    const valInput = screen.getByLabelText(/new tax value/i);
    const reasonInput = screen.getByLabelText(/reason for override/i);
    await user.clear(valInput);
    await user.type(valInput, 'abc');
    await user.type(reasonInput, 'Short');
    await user.click(screen.getByRole('button', { name: /save overwrite/i }));

    const alert = screen.getByRole('alert');
    expect(valInput).toHaveAttribute('aria-describedby', alert.id);
    expect(valInput).toHaveAttribute('aria-invalid', 'true');
  });
});

const ClientRoleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setRole } = useApp();
  useEffect(() => {
    setRole('client');
  }, []);
  return <>{children}</>;
};

describe('ApexTax AI Application Journey 2 Client Onboarding & Collaboration', () => {
  it('shows one dominant required action immediately on first client entry, with no blocking dialog', () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/dashboard/client']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    // No modal/dialog gates the first-login view
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // The dominant action is immediately visible and reachable, with its context (why, requester, due date)
    const dominantAction = screen.getByRole('button', { name: /continue required action/i });
    expect(dominantAction).toBeInTheDocument();
    expect(screen.getByText('Provide your 2025 W-2 and answer 1 question')).toBeInTheDocument();
    expect(screen.getByText(/david chen needs this information/i)).toBeInTheDocument();
    expect(screen.getByText('DUE DATE')).toBeInTheDocument();

    // Simulation disclosure is present but subordinate (inline, not a blocking overlay)
    expect(screen.getByText(/prototype simulation/i)).toBeInTheDocument();
  });

  it('the dominant action navigates directly into the required onboarding workspace', async () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/dashboard/client']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /continue required action/i }));

    expect(screen.getByText('Client Onboarding Workspace')).toBeInTheDocument();
    expect(screen.getByText('John Miller')).toBeInTheDocument();
  });

  it('navigates to onboarding checklist and displays step items', () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    // Checklist step list
    expect(screen.getByText('Required Information')).toBeInTheDocument();
    expect(screen.getByText('Provide your W-2 and answer transactions questions.')).toBeInTheDocument();

    // Active request details
    expect(screen.getByText('Provide your 2025 W-2')).toBeInTheDocument();
    expect(screen.getByText('Please upload a copy of your Form W-2 showing wages earned in 2025.')).toBeInTheDocument();
  });

  it('validates W-2 file upload picker metadata staging', async () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    const file = new File(['mock w2 content'], 'john_miller_w2_2025.pdf', { type: 'application/pdf' });
    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await user.upload(input, file);

    // Check file metadata staged UI
    expect(screen.getAllByText('john_miller_w2_2025.pdf').length).toBeGreaterThan(0);
    expect(screen.getByText(/15 Bytes/i)).toBeInTheDocument();
    
    // Disclosure text remains visible
    expect(screen.getByText(/the selected file is not uploaded or stored/i)).toBeInTheDocument();
  });

  it('rejects unsupported files and files exceeding size limit', () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // 1. Rejects unsupported extension/mime
    const badFile = new File(['bad'], 'exploit.exe', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [badFile] } });
    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();

    // 2. Rejects file exceeding 10MB
    const largeFile = new File(['a'.repeat(11 * 1024 * 1024)], 'huge_w2.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [largeFile] } });
    expect(screen.getByText(/exceeds the 10 MB limit/i)).toBeInTheDocument();
  });

  it('requires questionnaire answer to submit and updates progress on success', async () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    // Select file
    const file = new File(['w2 contents'], 'w2_stub.png', { type: 'image/png' });
    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    await user.upload(input, file);

    // Try submit without answering crypto question
    const submitBtn = screen.getByRole('button', { name: /submit to david/i });
    await user.click(submitBtn);

    // Should display validation error and block submit
    expect(screen.getByText(/please select an answer for this required question/i)).toBeInTheDocument();

    // Answer question
    const noRadio = screen.getByRole('radio', { name: 'No' });
    await user.click(noRadio);

    // Submit again
    await user.click(submitBtn);

    // Submission succeeded status renders
    expect(screen.getByText('Submitted to David Chen. Your preparer owns the next action.')).toBeInTheDocument();
  });

  it('displays messaging thread and allows sending/retrying messages', async () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2&thread=thread-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    // Message list displays mock messages
    expect(screen.getByText(/welcome to the ApexTax secure portal/i)).toBeInTheDocument();

    // Compose a valid message
    const composer = screen.getByPlaceholderText(/type a message to discuss this request/i);
    await user.type(composer, 'Here is my message draft.');
    
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    await user.click(sendBtn);

    // Verify it is added
    expect(screen.getByText('Here is my message draft.')).toBeInTheDocument();
  });

  it('restricts client from viewing or accessing internal notes threads', () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2&thread=thread-john-internal']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    // Internal notes thread blocked message is rendered
    expect(screen.getByText('This conversation is unavailable.')).toBeInTheDocument();
  });

  it('displays error recovery view for invalid URL query parameters', () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=invalid-request-ref']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    // Error recovery view matches
    expect(screen.getByText('Invalid Portal Reference')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset to checklist actions/i })).toBeInTheDocument();
  });

  it('rejects a file whose extension looks valid but whose detected MIME type is not an accepted type', () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;

    // Extension looks like a valid PDF, but the browser-detected MIME type says otherwise —
    // must not be accepted on the filename's say-so alone.
    const spoofedFile = new File(['MZ...'], 'totally-a-w2.pdf', { type: 'application/x-msdownload' });
    fireEvent.change(input, { target: { files: [spoofedFile] } });

    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
    expect(screen.queryByText('totally-a-w2.pdf')).not.toBeInTheDocument();
  });

  it('does not accept a valid JPEG merely because it is named .jpg', () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );

    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    const jpgFile = new File(['jpeg bytes'], 'w2_photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [jpgFile] } });

    expect(screen.queryByText(/unsupported file type/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('w2_photo.jpg').length).toBeGreaterThan(0);
  });

  it('does not invoke any file-content-reading method when a file is selected', async () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    const file = new File(['sensitive w2 contents'], 'w2_stub.png', { type: 'image/png' });
    const readAsDataURLSpy = vi.spyOn(FileReader.prototype, 'readAsDataURL');
    const readAsTextSpy = vi.spyOn(FileReader.prototype, 'readAsText');
    const readAsArrayBufferSpy = vi.spyOn(FileReader.prototype, 'readAsArrayBuffer');
    const arrayBufferSpy = vi.spyOn(File.prototype, 'arrayBuffer');
    const textSpy = vi.spyOn(File.prototype, 'text');

    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.getAllByText('w2_stub.png').length).toBeGreaterThan(0);
    expect(readAsDataURLSpy).not.toHaveBeenCalled();
    expect(readAsTextSpy).not.toHaveBeenCalled();
    expect(readAsArrayBufferSpy).not.toHaveBeenCalled();
    expect(arrayBufferSpy).not.toHaveBeenCalled();
    expect(textSpy).not.toHaveBeenCalled();

    readAsDataURLSpy.mockRestore();
    readAsTextSpy.mockRestore();
    readAsArrayBufferSpy.mockRestore();
    arrayBufferSpy.mockRestore();
    textSpy.mockRestore();
  });

  it('digital-asset question only allows one selected answer at a time (native radio group)', async () => {
    render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    const noRadio = screen.getByRole('radio', { name: 'No' });
    const unsureRadio = screen.getByRole('radio', { name: 'I am not sure' });

    await user.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    await user.click(unsureRadio);
    expect(unsureRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
    expect(noRadio).not.toBeChecked();
  });

  it('preserves the staged file and question answer after navigating to the conversation and back', async () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    const file = new File(['w2 contents'], 'w2_stub.png', { type: 'image/png' });
    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    await user.upload(input, file);
    await user.click(screen.getByRole('radio', { name: 'No' }));

    await user.click(screen.getByRole('button', { name: /ask preparer a question/i }));
    expect(screen.getByText(/subject: w-2 wage request/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to document request/i }));

    expect(screen.getAllByText('w2_stub.png').length).toBeGreaterThan(0);
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked();
  });

  it('shows "no outstanding client actions" on the dashboard once the W-2 request is submitted', async () => {
    const { container } = render(
      <AppProvider>
        <ClientRoleWrapper>
          <MemoryRouter initialEntries={['/onboarding?step=required-information&request=req-john-w2']}>
            <AppRoutes />
          </MemoryRouter>
        </ClientRoleWrapper>
      </AppProvider>
    );
    const user = userEvent.setup();

    const file = new File(['w2 contents'], 'w2_stub.png', { type: 'image/png' });
    const input = container.querySelector('#simulated-file-input') as HTMLInputElement;
    await user.upload(input, file);
    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: /submit to david/i }));

    expect(screen.getByText('Submitted to David Chen. Your preparer owns the next action.')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /back to client home/i }));

    expect(screen.getByText('No outstanding client actions')).toBeInTheDocument();
  });
});

