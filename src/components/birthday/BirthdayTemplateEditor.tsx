import React, { useState, useEffect } from 'react';
import { BirthdayTemplate } from '../../types/birthday.types';

interface BirthdayTemplateEditorProps {
  onSave: (template: BirthdayTemplate) => void;
  initialTemplate?: BirthdayTemplate;
}

export const BirthdayTemplateEditor: React.FC<BirthdayTemplateEditorProps> = ({
  onSave,
  initialTemplate
}) => {
  const [template, setTemplate] = useState<Partial<BirthdayTemplate>>({
    type: 'email',
    includesOffer: true,
    ...initialTemplate
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (template.content && template.type) {
      onSave(template as BirthdayTemplate);
    }
  };

  const previewTemplate = (content: string) => {
    return content
      .replace('{{name}}', 'John Doe')
      .replace('{{offer_code}}', 'BDAY2025')
      .replace('{{discount}}', '20%');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Message Type
        </label>
        <select
          value={template.type}
          onChange={(e) => setTemplate({ ...template, type: e.target.value as 'email' | 'sms' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {template.type === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            value={template.subject || ''}
            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Message Content
        </label>
        <textarea
          value={template.content || ''}
          onChange={(e) => setTemplate({ ...template, content: e.target.value })}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Use {{name}} for member's name, {{offer_code}} for special offer code"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={template.includesOffer}
          onChange={(e) => setTemplate({ ...template, includesOffer: e.target.checked })}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">
          Include special birthday offer
        </label>
      </div>

      {template.content && (
        <div className="p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="text-sm text-gray-600">
            {previewTemplate(template.content)}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Save Template
      </button>
    </form>
  );
};
