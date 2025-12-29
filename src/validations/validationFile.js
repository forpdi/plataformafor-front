import React from 'react';

import Messages from 'forpdi/src/Messages';
import { extractFileExtension } from 'forpdi/src/utils/util';

export function validationFile(file, acceptedFiles, maxSizeMB) {
  const { name: fileName, size: fileSizeBytes } = file;

  const fileExtension = extractFileExtension(fileName);
  const errorMsg = validateAcceptedFiles(acceptedFiles, fileExtension)
    || validateFileSize(maxSizeMB, fileSizeBytes);

  return {
    errors: { errorMsg },
    hasErrors: !!errorMsg,
  };
}

function validateAcceptedFiles(acceptedFiles, fileExtension) {
  if (!acceptedFiles.split(',').includes(fileExtension)) {
    return (
      <span>
        <b>{`${Messages.get('label.invalidFileExtension')}: `}</b>
        {`${fileExtension}`}
        <br />
        <b>{`${Messages.get('label.examplesValidFormats')}: `}</b>
        {`${acceptedFiles.replaceAll(/,\s*/g, ', ')}`}
      </span>
    );
  }

  return null;
}

function validateFileSize(maxSizeMB, fileSizeBytes) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSizeBytes > maxSizeBytes) {
    return (
      <span>
        <b>{`${Messages.get('label.fileSizeExceeded')}`}</b>
        <br />
        <b>{`${Messages.get('label.FileMaxSize')}: `}</b>
        {`${maxSizeMB}MB`}
      </span>
    );
  }

  return null;
}

export function validateImageSize(file, acceptedImageSize, onSuccess, onFailure) {
  const { width, height } = acceptedImageSize;
  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    if (img.width === width && img.height === height) {
      onSuccess();
    } else {
      const errorMsg = (
        <span>
          <b>Dimensão da imagem inválida</b>
          <br />
          <b>{`A imagem deve ter dimensão de ${width}x${height}`}</b>
        </span>
      );
      onFailure({ errorMsg });
    }
    URL.revokeObjectURL(img.src);
  };

  img.src = url;
}
